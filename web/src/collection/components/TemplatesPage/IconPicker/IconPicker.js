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

const useStyles = makeStyles((theme) => ({
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

/**
 * Get concrete picker properties depending on the desired icon kind.
 */
function usePickerProps(kind, icon, onChange) {
  const handleChangePredefined = useCallback(
    (name) =>
      onChange({
        kind: IconKind.PREDEFINED,
        key: name,
      }),
    [onChange]
  );

  if (kind === IconKind.PREDEFINED) {
    return { onChange: handleChangePredefined, icon: icon.key };
  } else {
    return {};
  }
}

function resolvePicker(kind) {
  if (kind === IconKind.PREDEFINED) {
    return StandardIconPicker;
  } else {
    return "div";
  }
}

function IconPicker(props) {
  const { icon, onChange, classes: classesProp = {}, className } = props;
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

  return (
    <div className={clsx(className)}>
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
