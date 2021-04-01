import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { InputLabel, MenuItem, Select } from "@material-ui/core";
import TaskTypeDescriptors, {
  TaskTypeDescriptorType,
} from "./TaskTypeDescriptors";
import FormControl from "@material-ui/core/FormControl";
import { useIntl } from "react-intl";
import useUniqueId from "../../../../common/hooks/useUniqueId";

const useStyles = makeStyles((theme) => ({
  form: {
    width: 200,
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    task: intl.formatMessage({ id: "tasks.one" }),
    taskTitle: (type) => intl.formatMessage({ id: type.title }),
  };
}

function TypeSelector(props) {
  const { value, onChange, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("type-selector");
  const handleChange = useCallback((event) => onChange(event.target.value));

  return (
    <FormControl
      variant="outlined"
      size="small"
      className={clsx(classes.form, className)}
      {...other}
    >
      <InputLabel id={labelId}>{messages.task}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        onChange={handleChange}
        label={messages.task}
      >
        {TaskTypeDescriptors.map((type) => (
          <MenuItem key={type.type} value={type}>
            {messages.taskTitle(type)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

TypeSelector.propTypes = {
  /**
   * Selected type.
   */
  value: TaskTypeDescriptorType.isRequired,
  /**
   * Handle type change.
   */
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default TypeSelector;
