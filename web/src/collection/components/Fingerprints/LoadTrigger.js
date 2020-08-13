import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import VisibilitySensor from "react-visibility-sensor";

const useStyles = makeStyles(() => ({
  triggerArea: {
    minWidth: 1,
    minHeight: 1,
  },
  progressContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
}));

function LoadTrigger(props) {
  const { loading, onLoad, hasMore, showProgress = true, className } = props;
  const classes = useStyles();

  const handleVisibilityChange = useCallback(
    (visible) => {
      if (visible && !loading && hasMore) {
        onLoad();
      }
    },
    [onLoad, loading, hasMore]
  );

  if (!hasMore) {
    return null;
  }

  return (
    <div className={className}>
      {!loading && (
        <VisibilitySensor onChange={handleVisibilityChange} partialVisibility>
          <div className={classes.triggerArea} />
        </VisibilitySensor>
      )}
      {showProgress && (
        <div className={classes.progressContainer}>
          <CircularProgress size={30} color="primary" />
        </div>
      )}
    </div>
  );
}

LoadTrigger.propTypes = {
  loading: PropTypes.bool.isRequired,
  onLoad: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  showProgress: PropTypes.bool,
  className: PropTypes.string,
};

export default LoadTrigger;
