import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import VisibilitySensor from "react-visibility-sensor";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useIntl } from "react-intl";
import { FileListLoadingTriggerProps } from "../FileList";
import useLoadTrigger from "../../../lib/hooks/useLoadTrigger";

const useStyles = makeStyles<Theme>((theme) => ({
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
    retry: intl.formatMessage({
      id: "actions.retry",
    }),
    error: intl.formatMessage({
      id: "file.load.error",
    }),
  };
}

function FileLinearListLoadTrigger(
  props: FileListLoadingTriggerProps
): JSX.Element | null {
  const { loading, error, onLoad, hasMore, className } = props;
  const { setVisible } = useLoadTrigger({ loading, error, onLoad, hasMore });
  const classes = useStyles();
  const messages = useMessages();

  if (!hasMore) {
    return null;
  }

  return (
    <div className={clsx(classes.trigger, className)}>
      {!loading && !error && (
        <VisibilitySensor onChange={setVisible} partialVisibility>
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

export default FileLinearListLoadTrigger;
