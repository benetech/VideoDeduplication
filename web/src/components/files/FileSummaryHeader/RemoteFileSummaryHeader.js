import React from "react";
import PropTypes from "prop-types";
import { FileType } from "../../../prop-types/FileType";
import FileSummary from "../FileSummary";
import BasicFileSummaryHeader from "./BasicFileSummaryHeader";

function RemoteFileSummaryHeader(props) {
  const { file, className, ...other } = props;

  return (
    <BasicFileSummaryHeader file={file} className={className} {...other}>
      <FileSummary.RemoteHash />
      <FileSummary.RemoteRepo />
      <FileSummary.RemoteOwner />
    </BasicFileSummaryHeader>
  );
}

RemoteFileSummaryHeader.propTypes = {
  /**
   * Video file to be displayed
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default RemoteFileSummaryHeader;
