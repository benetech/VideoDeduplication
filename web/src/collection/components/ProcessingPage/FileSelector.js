import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  selector: {
    height: 600,
    border: "4px dashed #D8D8D8",
  },
}));

function FileSelector(props) {
  const { className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.selector, className)}></div>;
}

FileSelector.propTypes = {
  /**
   * Submit a new task.
   */
  onSubmit: PropTypes.func,
  className: PropTypes.string,
};

export default FileSelector;
