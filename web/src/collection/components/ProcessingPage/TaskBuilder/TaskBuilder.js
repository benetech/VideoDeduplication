import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FormControl from "@material-ui/core/FormControl";
import { InputLabel, MenuItem, Select } from "@material-ui/core";
import Button from "../../../../common/components/Button";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import useUniqueId from "../../../../common/hooks/useUniqueId";
import { useIntl } from "react-intl";
import TaskTypes from "./TaskTypes";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 600,
    padding: theme.spacing(3),
    backgroundColor: theme.palette.common.white,
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  typeForm: {
    margin: theme.spacing(1),
    width: 200,
  },
  runButton: {
    marginLeft: theme.spacing(1),
  },
  title: {
    flexShrink: 0,
    flexGrow: 20,
    fontWeight: "bold",
    ...theme.mixins.title2,
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    task: intl.formatMessage({ id: "tasks.one" }),
    runTask: intl.formatMessage({ id: "actions.runTask" }),
    newTask: intl.formatMessage({ id: "task.new" }),
    taskTitle: (type) => intl.formatMessage({ id: type.title }),
  };
}

function TaskBuilder(props) {
  const { className, ...other } = props;
  const [taskType, setTaskType] = useState(TaskTypes[0]);
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("type-selector");

  const handleChange = useCallback((event) => setTaskType(event.target.value));

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{messages.newTask}</div>
        <FormControl
          variant="outlined"
          size="small"
          className={classes.typeForm}
        >
          <InputLabel id={labelId}>{messages.task}</InputLabel>
          <Select
            labelId={labelId}
            value={taskType}
            onChange={handleChange}
            label={messages.task}
          >
            {TaskTypes.map((type) => (
              <MenuItem key={type.type} value={type}>
                {messages.taskTitle(type)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          className={classes.runButton}
          color="primary"
          variant="contained"
        >
          <PlayArrowOutlinedIcon />
          {messages.runTask}
        </Button>
      </div>
    </div>
  );
}

TaskBuilder.propTypes = {
  className: PropTypes.string,
};

export default TaskBuilder;
