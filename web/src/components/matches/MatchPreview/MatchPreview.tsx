import React from "react";
import BasicContainer from "./BasicContainer";
import LocalMatchPreview from "./LocalMatchPreview";
import RemoteMatchPreview from "./RemoteMatchPreview";
import { FileMatch } from "../../../model/Match";
import { useIntl } from "react-intl";
import { VideoFile } from "../../../model/VideoFile";

/**
 * Get translated text
 */

function useMessages(file: VideoFile) {
  const intl = useIntl();
  return {
    ariaLabel: file.external
      ? intl.formatMessage({
          id: "aria.label.remoteMatch",
        })
      : intl.formatMessage(
          {
            id: "aria.label.matchedFile",
          },
          {
            name: file.filename,
          }
        ),
  };
}
/**
 * Display appropriate match preview.
 */

function MatchPreview(props: MatchPreviewProps): JSX.Element {
  const { match, ...other } = props;
  const messages = useMessages(match.file); // Select appropriate preview component

  const Preview = match.file.external ? RemoteMatchPreview : LocalMatchPreview;
  return (
    <Preview
      match={match}
      aria-label={messages.ariaLabel}
      data-selector="MatchPreview"
      data-file-id={match.file.id}
      {...other}
    />
  );
}

type MatchPreviewProps = {
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
/**
 * Preview container component
 */

MatchPreview.Container = BasicContainer;
export default MatchPreview;
