import React from "react";
import { VideoFile } from "../../../model/VideoFile";
import FileSummary from "../FileSummary";
import BasicFileSummaryHeader from "./BasicFileSummaryHeader";

function RemoteFileSummaryHeader(
  props: RemoteFileSummaryHeaderProps
): JSX.Element {
  const { file, className, ...other } = props;
  return (
    <BasicFileSummaryHeader file={file} className={className} {...other}>
      <FileSummary.RemoteHash />
      <FileSummary.RemoteRepo />
      <FileSummary.RemoteOwner />
    </BasicFileSummaryHeader>
  );
}

type RemoteFileSummaryHeaderProps = {
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
export default RemoteFileSummaryHeader;
