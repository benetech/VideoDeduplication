import React from "react";
import { VideoFile } from "../../../model/VideoFile";
import RemoteFileSummaryHeader from "./RemoteFileSummaryHeader";
import LocalFileSummaryHeader from "./LocalFileSummaryHeader";

function FileSummaryHeader(props: FileSummaryHeaderProps): JSX.Element {
  const { file, ...other } = props;
  const Header = file?.external
    ? RemoteFileSummaryHeader
    : LocalFileSummaryHeader;
  return <Header file={file} {...other} />;
}

type FileSummaryHeaderProps = {
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
export default FileSummaryHeader;
