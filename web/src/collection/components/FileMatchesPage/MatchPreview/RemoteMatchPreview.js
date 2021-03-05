import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileType from "../../../prop-types/FileType";
import PreviewHeader from "./PreviewHeader";
import PreviewDivider from "./PreviewDivider";
import PreviewFileAttributes from "./PreviewFileAttributes";
import { remoteAttributes } from "./attributes";
import Distance from "../../../../common/components/Distance";
import PreviewMainAction from "./PreviewMainAction";
import PreviewContainer from "./PreviewContainer";
import CloudOutlinedIcon from "@material-ui/icons/CloudOutlined";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import { routes } from "../../../../routing/routes";

const useStyles = makeStyles((theme) => ({
  root: {},
  spacer: {
    flexGrow: 1,
    display: "flex",
  },
}));

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
function useActions(matchFile, handleCopy, messages) {
  const history = useHistory();

  return useMemo(
    () => [
      {
        title: messages.showMatches,
        handler: () =>
          history.push(routes.collection.fileMatchesURL(matchFile?.id)),
      },
      {
        title: messages.copySHA,
        handler: handleCopy,
      },
    ],
    [matchFile?.id]
  );
}

function RemoteMatchPreview(props) {
  const {
    matchFile,
    motherFile,
    distance,
    highlight,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(matchFile?.hash)
      .then(null, (reason) => console.error("Copy hash failed", reason));
  }, [matchFile?.id]);

  const actions = useActions(matchFile, handleCopy, messages);

  return (
    <PreviewContainer
      matchFile={matchFile}
      className={clsx(classes.root, className)}
      {...other}
    >
      <PreviewHeader
        text={matchFile.hash}
        highlight={highlight}
        caption={messages.caption}
        icon={CloudOutlinedIcon}
        actions={actions}
      />
      <PreviewDivider />
      <PreviewFileAttributes file={matchFile} attrs={remoteAttributes} />
      <div className={classes.spacer} />
      <PreviewDivider />
      <Distance value={distance} />
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
   * Mother file
   */
  motherFile: FileType.isRequired,
  /**
   * Matched file
   */
  matchFile: FileType.isRequired,
  /**
   * Match distance
   */
  distance: PropTypes.number.isRequired,
  /**
   * File name substring to highlight
   */
  highlight: PropTypes.string,
  className: PropTypes.string,
};

export default RemoteMatchPreview;
