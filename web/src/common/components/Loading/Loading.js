import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
 * Interactive loading indicator.
 */
function Loading(props) {
  const { error, errorMessage, onRetry, progress, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const variant = progress == null ? "indeterminate" : "determinate";

  return (
    <div className={clsx(classes.root, className)}>
      {!error && (
        <CircularProgress
          variant={variant}
          value={progress * 100}
          size={30}
          color="primary"
        />
      )}
      {error && (
        <div className={classes.errorMessage}>
          {errorMessage}
          <div className={classes.retryLink} onClick={onRetry}>
            {messages.retry}
          </div>
        </div>
      )}
    </div>
  );
}

Loading.propTypes = {
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

export default Loading;
