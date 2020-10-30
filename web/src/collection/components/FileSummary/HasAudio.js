import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import VolumeOffOutlinedIcon from "@material-ui/icons/VolumeOffOutlined";
import VolumeUpOutlinedIcon from "@material-ui/icons/VolumeUpOutlined";
import { FileType } from "../FileBrowserPage/FileType";

const useStyles = makeStyles((theme) => ({}));

function HasAudio(props) {
  const { file, className, ...other } = props;
  const classes = useStyles();
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
