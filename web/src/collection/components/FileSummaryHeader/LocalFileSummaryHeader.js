import React from "react";
import PropTypes from "prop-types";
import { FileType } from "../../prop-types/FileType";
import FileSummary from "../FileSummary";
import useTheme from "@material-ui/styles/useTheme";
import { useMediaQuery } from "@material-ui/core";
import BasicFileSummaryHeader from "./BasicFileSummaryHeader";

/**
 * Check if the screen is small.
 */
function useSmallScreen() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("md"));
}

function LocalFileSummaryHeader(props) {
  const { file, className, ...other } = props;
  const small = useSmallScreen();

  return (
    <BasicFileSummaryHeader file={file} className={className} {...other}>
      <FileSummary.Name />
      <FileSummary.Fingerprint />
      <FileSummary.Duration />
      {!small && <FileSummary.CreationDate />}
      {!small && <FileSummary.HasAudio />}
    </BasicFileSummaryHeader>
  );
}

LocalFileSummaryHeader.propTypes = {
  /**
   * Video file to be displayed
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default LocalFileSummaryHeader;
