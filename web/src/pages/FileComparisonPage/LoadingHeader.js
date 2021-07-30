import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import Loading from "../../components/basic/Loading";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    minHeight: theme.spacing(12),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

function LoadingHeader(props) {
  const { error, errorMessage, onRetry, progress, className, ...other } = props;
  const classes = useStyles();
  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      <Loading
        error={error}
        errorMessage={errorMessage}
        onRetry={onRetry}
        progress={progress}
      />
    </Paper>
  );
}

LoadingHeader.propTypes = {
  /**
   * Indicate loading error
   */
  error: PropTypes.bool,
  /**
   * The value of the progress indicator for the determinate and static variants.
   * Value between 0 and 1.
   */
  progress: PropTypes.number,
  /**
   * Trigger loading of the next portion of files
   */
  onRetry: PropTypes.func.isRequired,
  /**
   * Message displayed when error=true
   */
  errorMessage: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default LoadingHeader;
