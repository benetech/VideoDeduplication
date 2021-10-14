import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { TextField, Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import useIconQuery from "./useIconQuery";
import IconList from "./IconList";

const useStyles = makeStyles<Theme>((theme) => ({
  pickerRoot: {
    height: "max-content",
  },
  search: {
    marginLeft: theme.spacing(2),
  },
  icons: {
    marginTop: theme.spacing(1),
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    search: intl.formatMessage({
      id: "actions.search",
    }),
  };
}

/**
 * Create a hook with staging value which
 * becomes an actual value after a delay.
 */
function useDelayState<T>(
  initial: T,
  timeout = 1000
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const [staging, setStaging] = useState<T>(initial);
  useEffect(() => {
    const handle = setTimeout(() => setValue(staging), timeout);
    return () => clearTimeout(handle);
  }, [value, staging, timeout]);
  return [value, staging, setStaging];
}

function StandardIconPicker(props: StandardIconPickerProps): JSX.Element {
  const {
    icon,
    onChange,
    classes: classesProp = {},
    initialQuery = "",
    className,
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [query, stagingQuery, setQuery] = useDelayState<string>(initialQuery);
  const icons = useIconQuery(query);
  const handleQuery = useCallback((event) => setQuery(event.target.value), []);
  return (
    <div className={clsx(classes.pickerRoot, className)}>
      <TextField
        label={messages.search}
        color="secondary"
        value={stagingQuery}
        onChange={handleQuery}
        className={classes.search}
      />
      <IconList
        names={icons}
        selected={icon}
        onSelect={onChange}
        className={clsx(classes.icons, classesProp.iconList)}
      />
    </div>
  );
}

type StandardIconPickerProps = {
  /**
   * Selected icon name.
   */
  icon?: string;

  /**
   * Callback for selected icon change.
   */
  onChange: (icon: string) => void;

  /**
   * Custom styles for StandardIconPicker components.
   */
  classes?: {
    /**
     * Custom CSS class for icon list element.
     */
    iconList?: string;
  };

  /**
   * Initial icon query.
   */
  initialQuery?: string;
  className?: string;
};
export default StandardIconPicker;
