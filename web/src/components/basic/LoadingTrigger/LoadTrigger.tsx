import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import VisibilitySensor from "react-visibility-sensor";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles<Theme>((theme) => ({
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
    retry: intl.formatMessage({
      id: "actions.retry",
    }),
  };
}
/**
 * Loading trigger
 */

function LoadTrigger(props: LoadTriggerProps): JSX.Element | null {
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
  const [visible, setVisible] = useState<boolean>(false);
  const [progress, setProgress] = useState<boolean>(false);
  const handleLoad = useCallback(async () => {
    setProgress(true);
    try {
      await onLoad();
    } finally {
      setProgress(false);
    }
  }, [onLoad]);

  const shouldAutoLoad = visible && hasMore && !loading && !error && !progress;

  useEffect(() => {
    if (shouldAutoLoad) {
      handleLoad().catch(console.error);
    }
  }, [shouldAutoLoad, onLoad]);

  if (!hasMore) {
    return null;
  }

  return (
    <Container className={clsx(classes.trigger, className)} {...other}>
      {!loading && !error && (
        <VisibilitySensor onChange={setVisible} partialVisibility>
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

export type ExpectedContainerProps = {
  children?: React.ReactNode;
  className?: string;
};

type LoadTriggerProps = {
  /**
   * Indicate loading error
   */
  error?: boolean;

  /**
   * Loading is in progress
   */
  loading: boolean;

  /**
   * Trigger loading of the next portion of items
   */
  onLoad: () => void;

  /**
   * Whether more items could be loaded
   */
  hasMore: boolean;

  /**
   * Container component
   */
  container?: React.ComponentType<ExpectedContainerProps>;

  /**
   * Message displayed when error=true
   */
  errorMessage: string;
  className?: string;
};
export default LoadTrigger;
