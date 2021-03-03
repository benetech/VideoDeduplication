import React from "react";
import PropTypes from "prop-types";
import FileType from "../../../prop-types/FileType";
import BasicContainer from "./BasicContainer";
import LocalMatchPreview from "./LocalMatchPreview";
import RemoteMatchPreview from "./RemoteMatchPreview";

/**
 * Display appropriate match preview.
 */
function MatchPreview(props) {
  const { matchFile, ...other } = props;

  // Select appropriate preview component
  const Preview = matchFile.external ? RemoteMatchPreview : LocalMatchPreview;
  return <Preview matchFile={matchFile} {...other} />;
}

MatchPreview.propTypes = {
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

/**
 * Preview container component
 */
MatchPreview.Container = BasicContainer;

export default MatchPreview;
