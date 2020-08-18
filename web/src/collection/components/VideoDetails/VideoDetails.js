import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useParams } from "react-router-dom";

const useStyles = makeStyles((theme) => ({}));

function VideoDetails(props) {
  const { className } = props;
  const { id } = useParams();
  const classes = useStyles();
  return <div className={clsx(className)}>Displaying {id}</div>;
}

VideoDetails.propTypes = {
  className: PropTypes.string,
};

export default VideoDetails;
