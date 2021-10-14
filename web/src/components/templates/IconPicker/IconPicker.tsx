import React, { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Paper, Theme } from "@material-ui/core";
import SelectableTabs, { SelectableTab } from "../../basic/SelectableTabs";
import { useIntl } from "react-intl";
import StandardIconPicker from "../StandardIconPicker";
import { IconKind, TemplateIcon } from "../../../model/Template";
import clsx from "clsx";
import IconUploader from "../IconUploader";
import TemplateIconViewer from "../TemplateIcon/TemplateIconViewer";

const useStyles = makeStyles<Theme>((theme) => ({
  preview: {
    marginLeft: theme.spacing(3),
    margin: theme.spacing(2),
    padding: theme.spacing(1),
    width: "max-content",
    height: "max-content",
  },
  tabs: {
    width: "max-content",
    margin: theme.spacing(1),
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  picker: {
    margin: theme.spacing(1),
    height: 220,
    minWidth: 400,
  },
  hide: {
    display: "none",
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    choose: intl.formatMessage({
      id: "actions.chooseIcon",
    }),
    upload: intl.formatMessage({
      id: "actions.uploadIcon",
    }),
    altIcon: intl.formatMessage({
      id: "templates.icon",
    }),
  };
}

function IconPicker(props: IconPickerProps): JSX.Element {
  const {
    icon,
    onChange,
    classes: classesProp = {},
    preview = true,
    initialQuery = "",
    className,
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [tab, setTab] = useState(IconKind.PREDEFINED);
  const handleChangeStandard = useCallback(
    (name) =>
      onChange({
        kind: IconKind.PREDEFINED,
        key: name,
      }),
    [onChange]
  );
  const handleChangeCustom = useCallback(
    (url) =>
      onChange({
        kind: IconKind.CUSTOM,
        key: url,
      }),
    [onChange]
  );
  return (
    <div className={clsx(className)}>
      {preview && (
        <Paper className={classes.preview}>
          <TemplateIconViewer icon={icon} />
        </Paper>
      )}
      <SelectableTabs value={tab} onChange={setTab} className={classes.tabs}>
        <SelectableTab
          label={messages.choose}
          value={IconKind.PREDEFINED}
          size="medium"
        />
        <SelectableTab
          label={messages.upload}
          value={IconKind.CUSTOM}
          size="medium"
        />
      </SelectableTabs>
      <StandardIconPicker
        onChange={handleChangeStandard}
        icon={icon?.key}
        className={clsx(
          classes.picker,
          classesProp.picker,
          tab !== IconKind.PREDEFINED && classes.hide
        )}
        initialQuery={initialQuery}
      />
      <IconUploader
        className={clsx(
          classes.picker,
          classesProp.picker,
          tab !== IconKind.CUSTOM && classes.hide
        )}
        onUpload={handleChangeCustom}
      />
    </div>
  );
}

type IconPickerProps = {
  /**
   * Picked icon.
   */
  icon: TemplateIcon;

  /**
   * Handle icon change.
   */
  onChange: (...args: any[]) => void;

  /**
   * Show selected icon preview.
   */
  preview?: boolean;

  /**
   * Custom picker elements styles.
   */
  classes?: {
    /**
     * Custom picker body (select or upload) class.
     */
    picker?: string;
  };

  /**
   * Initial standard icon search query.
   */
  initialQuery?: string;
  className?: string;
};
export default IconPicker;
