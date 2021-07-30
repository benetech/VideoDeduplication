import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ReactJson from "react-json-view";
import TaskType from "../../../prop-types/TaskType";

const useStyles = makeStyles({
  root: {
    maxHeight: "50vh",
    overflowY: "auto",
  },
});

function RawResults(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <ReactJson
        src={task.raw.result || { result: null }}
        displayDataTypes={false}
        name={false}
        groupArraysAfterLength={20}
      />
    </div>
  );
}

RawResults.propTypes = {
  /**
   * Task which results will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default RawResults;
