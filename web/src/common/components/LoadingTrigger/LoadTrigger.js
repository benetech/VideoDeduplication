import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import VisibilitySensor from "react-visibility-sensor";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  trigger: {},
  triggerArea: {
    minWidth: 1,
    minHeight: 1,
    width: "100%",
    height: "100%",
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
 * Loading trigger
 */
function LoadTrigger(props) {
  const {
    error,
    container: Container = "div",
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
        <VisibilitySensor
          onChange={handleVisibilityChange}
          partialVisibility="bottom"
        >
          <div className={classes.triggerArea} />
        </VisibilitySensor>
      )}
      {loading && <CircularProgress size={30} color="primary" />}
      {!loading && error && (
        <div className={classes.errorMessage}>
          {errorMessage}
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
   * Loading is in progress
   */
  loading: PropTypes.bool.isRequired,
  /**
   * Trigger loading of the next portion of items
   */
  onLoad: PropTypes.func.isRequired,
  /**
   * Whether more items could be loaded
   */
  hasMore: PropTypes.bool.isRequired,
  /**
   * Container component
   */
  container: PropTypes.elementType,
  /**
   * Message displayed when error=true
   */
  errorMessage: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default LoadTrigger;
