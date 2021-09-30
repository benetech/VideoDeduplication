import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, CircularProgress, Paper, Theme } from "@material-ui/core";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import IconButton from "@material-ui/core/IconButton";
import { useIntl } from "react-intl";
import { useShowProcessing } from "../../../routing/hooks";
import { ErrorCode, ServerError } from "../../../server-api/ServerError";

const useStyles = makeStyles<Theme>((theme) => ({
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
  errorMessage: { ...theme.mixins.title4 },
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
    retry: intl.formatMessage({
      id: "actions.retry",
    }),
    error: intl.formatMessage({
      id: "task.error.load.single",
    }),
    notFound: intl.formatMessage({
      id: "task.error.load.notFound",
    }),
    goBack: intl.formatMessage({
      id: "actions.goBack",
    }),
  };
}

function TaskLoadingHeader(props: TaskLoadingHeaderProps): JSX.Element {
  const { error, onRetry, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const handleBack = useShowProcessing();
  let content;

  if (error == null) {
    content = <CircularProgress color="primary" />;
  } else if (
    error instanceof ServerError &&
    error.code === ErrorCode.NotFound
  ) {
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

type TaskLoadingHeaderProps = {
  /**
   * True iff task is not loading and previous
   * attempt resulted in failure.
   */
  error?: Error | null;

  /**
   * Fires on retry.
   */
  onRetry: (...args: any[]) => void;
  className?: string;
};
export default TaskLoadingHeader;
