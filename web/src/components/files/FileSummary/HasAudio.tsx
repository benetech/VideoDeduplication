import React from "react";
import VolumeOffOutlinedIcon from "@material-ui/icons/VolumeOffOutlined";
import { VideoFile } from "../../../model/VideoFile";

function HasAudio(props: HasAudioProps): JSX.Element | null {
  const { file, className, ...other } = props;

  if (file == null) {
    return null;
  }

  return <VolumeOffOutlinedIcon className={className} {...other} />;
}

type HasAudioProps = {
  /**
   * Video file to be summarized.
   */
  file?: VideoFile;
  className?: string;
};
export default HasAudio;
