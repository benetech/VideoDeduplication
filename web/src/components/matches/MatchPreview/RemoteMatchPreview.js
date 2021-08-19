import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import PreviewHeader from "./PreviewHeader";
import PreviewDivider from "./PreviewDivider";
import PreviewFileAttributes from "./PreviewFileAttributes";
import { remoteAttributes } from "./attributes";
import Distance from "../Distance";
import PreviewMainAction from "./PreviewMainAction";
import PreviewContainer from "./PreviewContainer";
import CloudOutlinedIcon from "@material-ui/icons/CloudOutlined";
import { useIntl } from "react-intl";
import FileMatchType from "../../../prop-types/FileMatchType";
import { useShowMatches } from "../../../routing/hooks";

const useStyles = makeStyles({
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
    caption: intl.formatMessage({ id: "file.attr.remoteHash" }),
    copySHA: intl.formatMessage({ id: "actions.copyHash" }),
    ack: intl.formatMessage({ id: "actions.copyHash.ack" }),
    showMatches: intl.formatMessage({ id: "actions.showMatches" }),
  };
}

/**
 * Get match actions.
 */
function useActions(match, handleCopy, messages) {
  const showMatches = useShowMatches(match.file, [match.file.id]);

  return useMemo(
    () => [
      {
        title: messages.showMatches,
        handler: showMatches,
      },
      {
        title: messages.copySHA,
        handler: handleCopy,
      },
    ],
    [match.file.id]
  );
}

function RemoteMatchPreview(props) {
  const { match, highlight, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(match.file.hash)
      .then(null, (reason) => console.error("Copy hash failed", reason));
  }, [match.file.id]);

  const actions = useActions(match.file, handleCopy, messages);

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

RemoteMatchPreview.propTypes = {
  /**
   * Match details
   */
  match: FileMatchType.isRequired,
  /**
   * File name substring to highlight
   */
  highlight: PropTypes.string,
  className: PropTypes.string,
};

export default RemoteMatchPreview;
