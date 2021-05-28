import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../../../prop-types/TaskType";
import FrameMatch from "./FrameMatch";

const useStyles = makeStyles((theme) => ({
  match: {
    margin: theme.spacing(1),
  },
}));

function FindFrameResultsOverview(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const matches = task.result.matches;

  return (
    <div className={clsx(className)} {...other}>
      {matches.map((match) => (
        <FrameMatch
          match={match}
          className={classes.match}
          key={`${match.fileId}:${match.startMs}`}
        />
      ))}
    </div>
  );
}

FindFrameResultsOverview.propTypes = {
  /**
   * Find-Frame task which results will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default FindFrameResultsOverview;
