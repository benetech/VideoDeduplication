import React, { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Button from "../../basic/Button";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import { useIntl } from "react-intl";
import TaskViewDescriptors from "./TaskViewDescriptors";
import TypeSelector from "./TypeSelector";
import useRunTask from "../../../application/api/tasks/useRunTask";
import { makeTaskRequest, TaskRequest } from "../../../model/Task";
import { TaskViewDescriptor } from "./model";
import TaskBuilderForm from "./TaskBuilderForm";
import FlatPane from "../../basic/FlatPane/FlatPane";
import Title from "../../basic/Title";
import Spacer from "../../basic/Spacer";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.common.white,
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  select: {
    margin: theme.spacing(1),
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
  taskForm: {
    marginTop: theme.spacing(2),
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    runTask: intl.formatMessage({
      id: "actions.runTask",
    }),
    newTask: intl.formatMessage({
      id: "task.new",
    }),
  };
}

function TaskBuilder(props: TaskBuilderProps): JSX.Element {
  const { className, ...other } = props;
  const [taskView, setTaskView] = useState(TaskViewDescriptors[0]);
  const classes = useStyles();
  const messages = useMessages();
  const [req, setReq] = useState<TaskRequest>(makeTaskRequest(taskView.type));
  const [valid, setValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const runTask = useRunTask();

  const handleProcess = useCallback(async () => {
    try {
      setLoading(true);
      await runTask(req);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [req]);

  const handleViewChange = useCallback((view: TaskViewDescriptor) => {
    setTaskView(view);
    setReq(makeTaskRequest(view.type));
  }, []);

  return (
    <FlatPane className={className} {...other}>
      <Title text={messages.newTask} variant="subtitle">
        <Spacer />
        <TypeSelector
          value={taskView}
          onChange={handleViewChange}
          className={classes.select}
        />
        <Button
          className={classes.runButton}
          color="primary"
          variant="contained"
          disabled={!valid || loading}
          onClick={handleProcess}
        >
          <PlayArrowOutlinedIcon />
          {messages.runTask}
        </Button>
      </Title>
      <TaskBuilderForm
        valid={valid}
        request={req}
        onChange={setReq}
        onValidated={setValid}
        className={classes.taskForm}
      />
    </FlatPane>
  );
}

type TaskBuilderProps = {
  className?: string;
};
export default TaskBuilder;
