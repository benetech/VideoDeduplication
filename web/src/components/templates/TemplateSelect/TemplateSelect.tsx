import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import {
  Checkbox,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import TemplateIconViewer from "../TemplateIcon/TemplateIconViewer";
import FormControl from "@material-ui/core/FormControl";
import { useIntl } from "react-intl";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import { Template } from "../../../model/Template";
import { FormControlProps } from "@material-ui/core/FormControl/FormControl";

const useStyles = makeStyles<Theme>((theme) => ({
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
    labelTemplates: intl.formatMessage({
      id: "aria.label.templates",
    }),
  };
}

function TemplateSelect(props: TemplateSelectProps): JSX.Element {
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
            <TemplateIconViewer icon={template.icon} className={classes.icon} />
            <ListItemText primary={describe(template)} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

type TemplateSelectProps = Omit<FormControlProps, "onChange"> & {
  /**
   * Selected template ids.
   */
  value?: Template["id"][];

  /**
   * Templates to select from.
   */
  templates: Template[];

  /**
   * Handle selection change.
   */
  onChange: (value: Template["id"][]) => void;

  /**
   * Get template text description.
   */
  describe?: (template: Template) => string;
};
export default TemplateSelect;
