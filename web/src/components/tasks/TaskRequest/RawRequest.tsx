import React, { useMemo } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ReactJson from "react-json-view";
import { Task } from "../../../model/Task";
import { TaskRequestViewProps } from "./model";
import { JsonArray, JsonObject } from "../../../lib/types/Json";

const useStyles = makeStyles<Theme>({
  root: {
    maxHeight: "50vh",
    overflowY: "auto",
  },
});

/**
 * Get task raw request.
 */
function getRawRequest(task: Task): JsonObject | JsonArray {
  const request = task.raw?.request;
  if (typeof request === "object" && request != null) {
    return request;
  }
  return { request };
}

function RawRequest(props: TaskRequestViewProps): JSX.Element {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const rawRequest = useMemo(() => getRawRequest(task), [task]);
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <ReactJson
        src={rawRequest}
        displayDataTypes={false}
        name={false}
        groupArraysAfterLength={20}
      />
    </div>
  );
}

export default RawRequest;
