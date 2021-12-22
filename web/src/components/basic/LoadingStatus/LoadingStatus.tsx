import React, { HTMLAttributes } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Theme, Tooltip } from "@material-ui/core";
import { useIntl } from "react-intl";
import CircularProgress from "@material-ui/core/CircularProgress";
import { ErrorCode, ServerError } from "../../../server-api/ServerError";
import Title from "../Title";
import RetryIcon from "@material-ui/icons/Cached";

const useStyles = makeStyles<Theme>((theme) => ({
  loadingStatus: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    color: theme.palette.action.textInactive,
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    unknownError: intl.formatMessage({ id: "error.loading" }),
    notFoundError: intl.formatMessage({ id: "error.notFound" }),
    retry: intl.formatMessage({ id: "actions.retry" }),
  };
}

type LoadingStatusProps = HTMLAttributes<HTMLDivElement> & {
  error: Error | null;
  onRetry: () => void;
  variant?: "title" | "subtitle" | "card";
  className?: string;
};

function LoadingStatus(props: LoadingStatusProps): JSX.Element {
  const { error, onRetry, variant, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  let content: React.ReactNode;
  if (error == null) {
    content = <CircularProgress color="primary" size={35} />;
  } else if (
    error instanceof ServerError &&
    error.code === ErrorCode.NotFound
  ) {
    content = (
      <Title
        classes={{ text: classes.message }}
        text={messages.notFoundError}
        variant={variant}
      />
    );
  } else {
    content = (
      <Title
        classes={{ text: classes.message }}
        text={messages.unknownError}
        variant={variant}
      >
        <Tooltip title={messages.retry}>
          <IconButton onClick={onRetry} size="small">
            <RetryIcon />
          </IconButton>
        </Tooltip>
      </Title>
    );
  }
  return (
    <div className={clsx(classes.loadingStatus, className)} {...other}>
      {content}
    </div>
  );
}

export default LoadingStatus;
