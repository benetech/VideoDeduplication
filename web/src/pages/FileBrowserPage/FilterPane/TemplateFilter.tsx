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
import { useIntl } from "react-intl";
import FilterContainer from "./FilterContainer";
import FormControl from "@material-ui/core/FormControl";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import TemplateIconViewer from "../../../components/templates/TemplateIcon/TemplateIconViewer";
import useTemplatesAll from "../../../application/api/templates/useTemplatesAll";
import { Template } from "../../../model/Template";

const useStyles = makeStyles<Theme>((theme) => ({
  form: {
    width: "100%",
  },
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
    title: intl.formatMessage({
      id: "filter.template",
    }),
    tooltip: intl.formatMessage({
      id: "filter.templates.help",
    }),
    labelTemplates: intl.formatMessage({
      id: "aria.label.templates",
    }),
  };
}

/**
 * Get template description.
 * @param template
 */
function description(template: Template): string {
  if (template.fileCount != null) {
    return `${template.name} (${template.fileCount})`;
  }

  return template.name;
}

function TemplateFilter(props: TemplateFilterProps): JSX.Element {
  const { value = [], onChange, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("template-label-");
  const { templates } = useTemplatesAll();
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
    <FilterContainer
      title={messages.title}
      className={clsx(className)}
      tooltip={messages.tooltip}
      {...other}
    >
      <FormControl className={classes.form}>
        <InputLabel id={labelId}>{messages.labelTemplates}</InputLabel>
        <Select
          labelId={labelId}
          multiple
          value={value}
          onChange={handleChange}
          input={<Input />}
          renderValue={renderValue}
          disabled={!templates || templates.length === 0}
        >
          {templates.map((template) => (
            <MenuItem key={template.id} value={template.id}>
              <Checkbox checked={value.indexOf(template.id) > -1} />
              <TemplateIconViewer
                icon={template.icon}
                className={classes.icon}
              />
              <ListItemText primary={description(template)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </FilterContainer>
  );
}

type TemplateFilterProps = {
  /**
   * Selected template ids.
   */
  value: Template["id"][];

  /**
   * Handle selection change.
   */
  onChange: (value: Template["id"][]) => void;
  className?: string;
};
export default TemplateFilter;
