import React from "react";
import PropTypes from "prop-types";
import BasicContainer from "./BasicContainer";
import LocalMatchPreview from "./LocalMatchPreview";
import RemoteMatchPreview from "./RemoteMatchPreview";
import FileMatchType from "../../../../application/match/prop-types/FileMatchType";
import { useIntl } from "react-intl";

/**
 * Get translated text
 */
function useMessages(file) {
  const intl = useIntl();

  return {
    ariaLabel: file.external
      ? intl.formatMessage({ id: "aria.label.remoteMatch" })
      : intl.formatMessage(
          { id: "aria.label.matchedFile" },
          { name: file.filename }
        ),
  };
}

/**
 * Display appropriate match preview.
 */
function MatchPreview(props) {
  const { match, ...other } = props;
  const messages = useMessages(match.file);

  // Select appropriate preview component
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

MatchPreview.propTypes = {
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

/**
 * Preview container component
 */
MatchPreview.Container = BasicContainer;

export default MatchPreview;
