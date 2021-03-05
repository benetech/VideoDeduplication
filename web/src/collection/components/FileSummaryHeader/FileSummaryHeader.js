import React from "react";
import PropTypes from "prop-types";
import { FileType } from "../../prop-types/FileType";
import RemoteFileSummaryHeader from "./RemoteFileSummaryHeader";
import LocalFileSummaryHeader from "./LocalFileSummaryHeader";

function FileSummaryHeader(props) {
  const { file, ...other } = props;

  const Header = file?.external
    ? RemoteFileSummaryHeader
    : LocalFileSummaryHeader;

  return <Header file={file} {...other} />;
}

FileSummaryHeader.propTypes = {
  /**
   * Video file to be displayed
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default FileSummaryHeader;
