import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import VisibilitySensor from "react-visibility-sensor";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  trigger: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: theme.palette.border.light,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
    minHeight: theme.spacing(2 * 3 + 5),
  },
  triggerArea: {
    minWidth: 1,
    minHeight: 1,
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    ...theme.mixins.title4,
  },
  retryLink: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    paddingLeft: theme.spacing(1),
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    retry: intl.formatMessage({ id: "actions.retry" }),
    error: intl.formatMessage({ id: "file.load.error" }),
  };
}

function FileLinearListLoadTrigger(props) {
  const { loading, error, onLoad, hasMore, className } = props;
  const classes = useStyles();
  const messages = useMessages();

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
    <div className={clsx(classes.trigger, className)}>
      {!loading && !error && (
        <VisibilitySensor onChange={handleVisibilityChange} partialVisibility>
          <div className={classes.triggerArea} />
        </VisibilitySensor>
      )}
      {loading && <CircularProgress size={30} color="primary" />}
      {!loading && error && (
        <div className={classes.errorMessage}>
          {messages.error}
          <div className={classes.retryLink} onClick={onLoad}>
            {messages.retry}
          </div>
        </div>
      )}
    </div>
  );
}

FileLinearListLoadTrigger.propTypes = {
  /**
   * Indicate loading error
   */
  error: PropTypes.bool,
  /**
   * File loading is in progress
   */
  loading: PropTypes.bool.isRequired,
  /**
   * Trigger loading of the next portion of files
   */
  onLoad: PropTypes.func.isRequired,
  /**
   * Whether more files could be loaded
   */
  hasMore: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

export default FileLinearListLoadTrigger;
