import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import FilterContainer from "./FilterContainer";
import FormControl from "@material-ui/core/FormControl";
import {
  Checkbox,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@material-ui/core";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import TemplateIcon from "../../TemplatesPage/TemplateIcon/TemplateIcon";
import useLoadAllTemplates from "../../../application/api/templates/useLoadAllTemplates";

const useStyles = makeStyles((theme) => ({
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
    title: intl.formatMessage({ id: "filter.template" }),
    tooltip: intl.formatMessage({ id: "filter.templates.help" }),
    labelTemplates: intl.formatMessage({ id: "aria.label.templates" }),
  };
}

/**
 * Get template description.
 * @param template
 */
function description(template) {
  if (template.fileCount != null) {
    return `${template.name} (${template.fileCount})`;
  }
  return template.name;
}

function TemplateFilter(props) {
  const { value = [], onChange, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("template-label-");
  const { templates } = useLoadAllTemplates();

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
              <TemplateIcon icon={template.icon} className={classes.icon} />
              <ListItemText primary={description(template)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </FilterContainer>
  );
}

TemplateFilter.propTypes = {
  /**
   * Selected template ids.
   */
  value: PropTypes.arrayOf(PropTypes.number).isRequired,
  /**
   * Handle selection change.
   */
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default TemplateFilter;
