import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  icon: {
    ...theme.mixins.noselect,
  },
}));

function ExifIcon(props) {
  const { className } = props;
  const classes = useStyles();

  return <div className={clsx(classes.icon, className)}>[EXIF]</div>;
}

ExifIcon.propTypes = {
  className: PropTypes.string,
};

export default ExifIcon;
