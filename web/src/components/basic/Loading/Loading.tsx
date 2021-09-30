import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>((theme) => ({
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
    retry: intl.formatMessage({
      id: "actions.retry",
    }),
  };
}
/**
 * Interactive loading indicator.
 */

function Loading(props: LoadingProps): JSX.Element {
  const { error, errorMessage, onRetry, progress, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const variant = progress == null ? "indeterminate" : "determinate";
  return (
    <div className={clsx(classes.root, className)}>
      {!error && (
        <CircularProgress
          variant={variant}
          value={(progress || 0) * 100}
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

type LoadingProps = {
  /**
   * Indicate loading error
   */
  error?: boolean;

  /**
   * The value of the progress indicator for the determinate and static variants.
   * Value between 0 and 1.
   */
  progress?: number;

  /**
   * Trigger loading of the next portion of files
   */
  onRetry: (...args: any[]) => void;

  /**
   * Message displayed when error=true
   */
  errorMessage: string;
  className?: string;
};
export default Loading;
