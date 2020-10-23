import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import VisibilitySensor from "react-visibility-sensor";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  trigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  triggerArea: {
    minWidth: 1,
    minHeight: 1,
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    ...theme.mixins.title4,
  },
  retryLink: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    paddingTop: theme.spacing(1),
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    retry: intl.formatMessage({ id: "actions.retry" }),
  };
}

/**
 * Match loading trigger
 */
function LoadTrigger(props) {
  const {
    error,
    container: Container,
    hasMore,
    loading,
    onLoad,
    errorMessage,
    className,
    ...other
  } = props;
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
    <Container className={clsx(classes.trigger, className)} {...other}>
      {!loading && !error && (
        <VisibilitySensor onChange={handleVisibilityChange} partialVisibility>
          <div className={classes.triggerArea} />
        </VisibilitySensor>
      )}
      {loading && <CircularProgress size={30} color="primary" />}
      {!loading && error && (
        <div className={errorMessage}>
          {messages.error}
          <div className={classes.retryLink} onClick={onLoad}>
            {messages.retry}
          </div>
        </div>
      )}
    </Container>
  );
}

LoadTrigger.propTypes = {
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
  /**
   * Container component
   */
  container: PropTypes.elementType.isRequired,
  /**
   * Message displayed when error=true
   */
  errorMessage: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default LoadTrigger;
