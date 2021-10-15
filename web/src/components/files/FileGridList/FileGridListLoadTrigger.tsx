import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import FPGridListItemContainer from "./FileGridListItemContainer";
import VisibilitySensor from "react-visibility-sensor";
import CircularProgress from "@material-ui/core/CircularProgress";
import { FileListLoadingTriggerProps } from "../FileList";
import useLoadTrigger from "../../../lib/hooks/useLoadTrigger";

const useStyles = makeStyles<Theme>((theme) => ({
  trigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
    minHeight: 140,
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
    retry: intl.formatMessage({
      id: "actions.retry",
    }),
    error: intl.formatMessage({
      id: "file.load.error",
    }),
  };
}

function FileGridListLoadTrigger(
  props: FileListLoadingTriggerProps
): JSX.Element | null {
  const { loading, error, onLoad, hasMore, perRow = 3, className } = props;
  const { setVisible } = useLoadTrigger({ loading, error, onLoad, hasMore });
  const classes = useStyles();
  const messages = useMessages();

  if (!hasMore) {
    return null;
  }

  return (
    <FPGridListItemContainer
      className={clsx(classes.trigger, className)}
      perRow={perRow}
    >
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
    </FPGridListItemContainer>
  );
}

export default FileGridListLoadTrigger;
