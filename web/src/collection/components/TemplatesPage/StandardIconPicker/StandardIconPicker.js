import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { TextField } from "@material-ui/core";
import { useIntl } from "react-intl";
import useIconQuery from "./useIconQuery";
import IconList from "./IconList";

const useStyles = makeStyles((theme) => ({
  pickerRoot: {},
  search: {
    marginLeft: theme.spacing(2),
  },
  icons: {
    marginTop: theme.spacing(1),
    width: "max-content",
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    search: intl.formatMessage({ id: "actions.search" }),
  };
}

/**
 * Create a hook with staging value which
 * becomes an actual value after a delay.
 */
function useDelayState(initial, timeout = 1000) {
  const [value, setValue] = useState(initial);
  const [staging, setStaging] = useState(initial);
  useEffect(() => {
    const handle = setTimeout(() => setValue(staging), timeout);
    return () => clearTimeout(handle);
  }, [value, staging, timeout]);

  return [value, staging, setStaging];
}

function StandardIconPicker(props) {
  const { icon, onChange, classes: classesProp = {}, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [query, stagingQuery, setQuery] = useDelayState("");
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

StandardIconPicker.propTypes = {
  /**
   * Selected icon name.
   */
  icon: PropTypes.string,
  /**
   * Callback for selected icon change.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Custom styles for StandardIconPicker components.
   */
  classes: PropTypes.shape({
    /**
     * Custom CSS class for icon list element.
     */
    iconList: PropTypes.string,
  }),
  className: PropTypes.string,
};

export default StandardIconPicker;
