import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({}));

function Presets(props) {
  const { className } = props;
  const classes = useStyles();
  return <div className={clsx(className)} />;
}

Presets.propTypes = {
  className: PropTypes.string,
};

export default Presets;
