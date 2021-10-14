import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { InputLabel, MenuItem, Select, Theme } from "@material-ui/core";
import TaskViewDescriptors from "./TaskViewDescriptors";
import FormControl from "@material-ui/core/FormControl";
import { useIntl } from "react-intl";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import { TaskViewDescriptor } from "./model";

const useStyles = makeStyles<Theme>({
  form: {
    width: 200,
  },
});
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    task: intl.formatMessage({
      id: "tasks.one",
    }),
    taskTitle: (title: string) =>
      intl.formatMessage({
        id: title,
      }),
  };
}

function TypeSelector(props: TypeSelectorProps): JSX.Element {
  const { value, onChange, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("type-selector");
  const handleChange = useCallback((event) => onChange(event.target.value), []);

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
        {TaskViewDescriptors.map((view) => (
          <MenuItem key={view.type} value={view as any}>
            {messages.taskTitle(view.title)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

type TypeSelectorProps = {
  /** Selected type. */
  value: TaskViewDescriptor;
  /** Handle type change. */
  onChange: (value: TaskViewDescriptor) => void;
  className?: string;
};
export default TypeSelector;
