import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import {
  Checkbox,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@material-ui/core";
import TemplateIcon from "../TemplateIcon/TemplateIcon";
import FormControl from "@material-ui/core/FormControl";
import { useIntl } from "react-intl";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import { TemplateType } from "../../../prop-types/TemplateType";

const useStyles = makeStyles((theme) => ({
  form: {},
  icon: {
    width: 25,
    height: 25,
    fontSize: 25,
    marginRight: theme.spacing(2),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    labelTemplates: intl.formatMessage({ id: "aria.label.templates" }),
  };
}

function TemplateSelect(props) {
  const {
    value = [],
    onChange,
    templates,
    describe = (template) => template.name,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("template-label-");

  const handleChange = useCallback(
    (event) => onChange(event.target.value),
    [onChange]
  );

  const renderValue = useCallback(
    (selected) => {
      const selectedTemplates = templates.filter(
        (template) => selected.indexOf(template.id) > -1
      );
      const selectedNames = selectedTemplates.map((template) => template.name);
      return selectedNames.join(", ");
    },
    [templates]
  );

  return (
    <FormControl className={clsx(classes.form, className)} fullWidth {...other}>
      <InputLabel id={labelId}>{messages.labelTemplates}</InputLabel>
      <Select
        labelId={labelId}
        multiple
        value={value}
        onChange={handleChange}
        input={<Input />}
        renderValue={renderValue}
        disabled={!(templates?.length > 0)}
      >
        {templates.map((template) => (
          <MenuItem key={template.id} value={template.id}>
            <Checkbox checked={value.indexOf(template.id) > -1} />
            <TemplateIcon icon={template.icon} className={classes.icon} />
            <ListItemText primary={describe(template)} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

TemplateSelect.propTypes = {
  /**
   * Selected template ids.
   */
  value: PropTypes.arrayOf(PropTypes.number),
  /**
   * Templates to select from.
   */
  templates: PropTypes.arrayOf(TemplateType.isRequired).isRequired,
  /**
   * Handle selection change.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Get template text description.
   */
  describe: PropTypes.func,
  className: PropTypes.string,
};

export default TemplateSelect;
