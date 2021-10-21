import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import { TaskError } from "../../../model/Task";
import AttributeTable from "../../basic/AttributeTable";
import errorAttributes from "./errorAttributes";

const useStyles = makeStyles<Theme>((theme) => ({
  taskError: {},
  logsContainer: {
    marginTop: theme.spacing(2),
    overflow: "auto",
    width: "100%",
    padding: theme.spacing(2),
    paddingTop: 0,
    paddingBottom: 0,
    ...theme.mixins.logs,
  },
}));

type TaskErrorProps = {
  error: TaskError;
  className?: string;
};

function TaskErrorView(props: TaskErrorProps): JSX.Element {
  const { error, className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.taskError, className)}>
      <AttributeTable value={error} attributes={errorAttributes} />
      <div className={classes.logsContainer}>
        <pre>{error.traceback}</pre>
      </div>
    </div>
  );
}

export default TaskErrorView;
