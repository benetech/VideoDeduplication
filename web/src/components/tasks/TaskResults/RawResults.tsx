import React, { useMemo } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ReactJson from "react-json-view";
import { Task } from "../../../model/Task";
import { JsonArray, JsonObject } from "../../../lib/types/Json";

const useStyles = makeStyles<Theme>({
  root: {
    maxHeight: "50vh",
    overflowY: "auto",
  },
});

/**
 * Get task raw result.
 */
function getRawResult(task: Task): JsonObject | JsonArray {
  const result = task.raw?.result;
  if (typeof result === "object" && result != null) {
    return result;
  }
  return { result };
}

function RawResults(props: RawResultsProps): JSX.Element {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const rawResult = useMemo(() => getRawResult(task), [task]);
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <ReactJson
        src={rawResult}
        displayDataTypes={false}
        name={false}
        groupArraysAfterLength={20}
      />
    </div>
  );
}

type RawResultsProps = {
  /**
   * Task which results will be displayed.
   */
  task: Task;
  className?: string;
};
export default RawResults;
