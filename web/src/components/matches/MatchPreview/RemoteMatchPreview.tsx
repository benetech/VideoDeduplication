import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import PreviewHeader from "./PreviewHeader";
import PreviewDivider from "./PreviewDivider";
import PreviewFileAttributes from "./PreviewFileAttributes";
import { remoteAttributes } from "./attributes";
import Distance from "../Distance";
import PreviewMainAction from "./PreviewMainAction";
import PreviewContainer from "./PreviewContainer";
import CloudOutlinedIcon from "@material-ui/icons/CloudOutlined";
import { useIntl } from "react-intl";
import { FileMatch } from "../../../model/Match";
import { useShowMatches } from "../../../routing/hooks";
import Action from "../../../model/Action";

const useStyles = makeStyles<Theme>({
  root: {},
  spacer: {
    flexGrow: 1,
    display: "flex",
  },
});
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    caption: intl.formatMessage({
      id: "file.attr.remoteHash",
    }),
    copySHA: intl.formatMessage({
      id: "actions.copyHash",
    }),
    ack: intl.formatMessage({
      id: "actions.copyHash.ack",
    }),
    showMatches: intl.formatMessage({
      id: "actions.showMatches",
    }),
  };
}
/**
 * Get match actions.
 */

function useActions(
  match: FileMatch,
  handleCopy: () => void,
  messages: ReturnType<typeof useMessages>
): Action[] {
  const showMatches = useShowMatches();
  const handleShowMatches = useCallback(
    () => showMatches(match.file),
    [match.file.id]
  );
  return useMemo(
    () => [
      {
        title: messages.showMatches,
        handler: handleShowMatches,
      },
      {
        title: messages.copySHA,
        handler: handleCopy,
      },
    ],
    [match.file.id]
  );
}

function RemoteMatchPreview(props: RemoteMatchPreviewProps): JSX.Element {
  const { match, highlight, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(match.file.hash)
      .then(null, (reason) => console.error("Copy hash failed", reason));
  }, [match.file.id]);
  const actions = useActions(match, handleCopy, messages);
  return (
    <PreviewContainer className={clsx(classes.root, className)} {...other}>
      <PreviewHeader
        text={match.file.hash}
        highlight={highlight}
        caption={messages.caption}
        icon={CloudOutlinedIcon}
        actions={actions}
      />
      <PreviewDivider />
      <PreviewFileAttributes file={match.file} attrs={remoteAttributes} />
      <div className={classes.spacer} />
      <PreviewDivider />
      <Distance value={match.distance} />
      <PreviewDivider />
      <PreviewMainAction
        name={messages.copySHA}
        onFire={handleCopy}
        ack={messages.ack}
      />
    </PreviewContainer>
  );
}

type RemoteMatchPreviewProps = {
  /**
   * Match details
   */
  match: FileMatch;

  /**
   * File name substring to highlight
   */
  highlight?: string;
  className?: string;
};
export default RemoteMatchPreview;
