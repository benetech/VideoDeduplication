import React from "react";
import PropTypes from "prop-types";
import VolumeOffOutlinedIcon from "@material-ui/icons/VolumeOffOutlined";
import { FileType } from "../../prop-types/FileType";

function HasAudio(props) {
  const { className, ...other } = props;
  return <VolumeOffOutlinedIcon className={className} {...other} />;
}

HasAudio.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType,
  className: PropTypes.string,
};

export default HasAudio;
