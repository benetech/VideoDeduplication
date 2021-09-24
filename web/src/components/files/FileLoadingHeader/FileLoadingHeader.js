import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useIntl } from "react-intl";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import { ButtonBase } from "@material-ui/core";
import { ErrorCode } from "../../../server-api/ServerError";

const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    height: theme.spacing(10),
    padding: theme.spacing(2),
    minWidth: 0,
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...theme.mixins.title4,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  retryLink: {
    ...theme.mixins.title4,
    color: theme.palette.primary.main,
    cursor: "pointer",
    paddingLeft: theme.spacing(1),
  },
  progress: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    flexShrink: 1,
    winWidth: 0,
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    retry: intl.formatMessage({ id: "actions.retry" }),
    error: intl.formatMessage({ id: "file.load.error.single" }),
    notFound: intl.formatMessage({ id: "file.load.error.notFound" }),
    goBack: intl.formatMessage({ id: "actions.goBack" }),
  };
}

function FileLoadingHeader(props) {
  const { error, onRetry, onBack, className } = props;
  const classes = useStyles();
  const messages = useMessages();

  if (!error) {
    return (
      <div className={clsx(classes.header, className)}>
        {onBack && (
          <IconButton onClick={onBack} aria-label={messages.goBack}>
            <ArrowBackOutlinedIcon />
          </IconButton>
        )}
        <div className={classes.progress}>
          <CircularProgress color="primary" />
        </div>
      </div>
    );
  }

  let content;
  if (error.status === ErrorCode.NotFound) {
    content = <div className={classes.errorMessage}>{messages.notFound}</div>;
  } else {
    content = (
      <div className={classes.errorMessage}>
        {messages.error}
        <ButtonBase
          className={classes.retryLink}
          onClick={onRetry}
          focusRipple
          disableTouchRipple
        >
          {messages.retry}
        </ButtonBase>
      </div>
    );
  }

  return (
    <div className={clsx(classes.header, className)}>
      {onBack && (
        <IconButton onClick={onBack} aria-label={messages.goBack}>
          <ArrowBackOutlinedIcon />
        </IconButton>
      )}
      {content}
    </div>
  );
}

FileLoadingHeader.propTypes = {
  /**
   * True iff file is not loading and previous
   * attempt resulted in failure.
   */
  error: PropTypes.shape({
    status: PropTypes.any,
  }),
  /**
   * Fires on retry.
   */
  onRetry: PropTypes.func.isRequired,
  /**
   * Handle go-back action.
   */
  onBack: PropTypes.func,
  className: PropTypes.string,
};

export default FileLoadingHeader;
