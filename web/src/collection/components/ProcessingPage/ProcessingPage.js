import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({}));

function ProcessingPage(props) {
  const { className } = props;
  const classes = useStyles();
  return <div className={clsx(className)}>Hello Processing!!!</div>;
}

ProcessingPage.propTypes = {
  className: PropTypes.string,
};

export default ProcessingPage;
