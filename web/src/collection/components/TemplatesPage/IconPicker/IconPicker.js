import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SelectableTabs, {
  SelectableTab,
} from "../../../../common/components/SelectableTabs";
import IconKind from "../../../state/templates/IconKind";
import { useIntl } from "react-intl";
import StandardIconPicker from "../StandardIconPicker";
import { TemplateIconType } from "../../../prop-types/TemplateType";
import clsx from "clsx";
import IconUploader from "../IconUploader";
import TemplateIcon from "../TemplateIcon/TemplateIcon";
import { Paper } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  preview: {
    marginLeft: theme.spacing(3),
    margin: theme.spacing(2),
    padding: theme.spacing(1),
    width: "max-content",
    height: "max-content",
  },
  tabs: {
    maxWidth: 150,
    margin: theme.spacing(1),
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  picker: {
    margin: theme.spacing(1),
    height: 350,
    width: 400,
  },
  hide: { display: "none" },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    choose: intl.formatMessage({ id: "actions.chooseIcon" }),
    upload: intl.formatMessage({ id: "actions.uploadIcon" }),
    altIcon: intl.formatMessage({ id: "templates.icon" }),
  };
}

function IconPicker(props) {
  const {
    icon,
    onChange,
    classes: classesProp = {},
    preview = true,
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
          <TemplateIcon icon={icon} />
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

IconPicker.propTypes = {
  /**
   * Picked icon.
   */
  icon: TemplateIconType,
  /**
   * Handle icon change.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Show selected icon preview.
   */
  preview: PropTypes.bool,
  /**
   * Custom picker elements styles.
   */
  classes: PropTypes.shape({
    /**
     * Custom picker body (select or upload) class.
     */
    picker: PropTypes.string,
  }),
  className: PropTypes.string,
};

export default IconPicker;
