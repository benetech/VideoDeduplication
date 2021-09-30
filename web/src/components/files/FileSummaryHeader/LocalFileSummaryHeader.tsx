import React from "react";
import { VideoFile } from "../../../model/VideoFile";
import FileSummary from "../FileSummary";
import useTheme from "@material-ui/styles/useTheme";
import { Theme, useMediaQuery } from "@material-ui/core";
import BasicFileSummaryHeader from "./BasicFileSummaryHeader";

/**
 * Check if the screen is small.
 */

function useSmallScreen() {
  const theme = useTheme<Theme>();
  return useMediaQuery(theme.breakpoints.down("md"));
}

function LocalFileSummaryHeader(
  props: LocalFileSummaryHeaderProps
): JSX.Element {
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

type LocalFileSummaryHeaderProps = {
  /**
   * Video file to be displayed
   */
  file: VideoFile;

  /**
   * Handle go-back action.
   */
  onBack?: (...args: any[]) => void;
  className?: string;
};
export default LocalFileSummaryHeader;
