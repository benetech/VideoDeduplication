import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, CircularProgress, Paper } from "@material-ui/core";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import IconButton from "@material-ui/core/IconButton";
import { useIntl } from "react-intl";
import { useShowProcessing } from "../../../routing/hooks";
import { ErrorCode } from "../../../server-api/ServerError";

const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    minHeight: 102,
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 2,
  },
  errorMessage: {
    ...theme.mixins.title4,
  },
  retryLink: {
    ...theme.mixins.title4,
    color: theme.palette.primary.main,
    paddingLeft: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    retry: intl.formatMessage({ id: "actions.retry" }),
    error: intl.formatMessage({ id: "task.error.load.single" }),
    notFound: intl.formatMessage({ id: "task.error.load.notFound" }),
    goBack: intl.formatMessage({ id: "actions.goBack" }),
  };
}

function TaskLoadingHeader(props) {
  const { error, onRetry, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const handleBack = useShowProcessing();

  let content;
  if (!error) {
    content = <CircularProgress color="primary" />;
  } else if (error.status === ErrorCode.NotFound) {
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
    <Paper className={clsx(classes.header, className)} {...other}>
      <IconButton onClick={handleBack} aria-label={messages.goBack}>
        <ArrowBackOutlinedIcon />
      </IconButton>
      <div className={classes.progressContainer}>{content}</div>
    </Paper>
  );
}

TaskLoadingHeader.propTypes = {
  /**
   * True iff task is not loading and previous
   * attempt resulted in failure.
   */
  error: PropTypes.shape({
    status: PropTypes.any,
  }),
  /**
   * Fires on retry.
   */
  onRetry: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default TaskLoadingHeader;
