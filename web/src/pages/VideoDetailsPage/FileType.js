import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ValueBadge from "./ValueBadge";

const useStyles = makeStyles({
  type: {
    backgroundColor: "#E691A1",
  },
});

function FileType(props) {
  const { type, className } = props;
  const classes = useStyles();
  return <ValueBadge className={clsx(classes.type, className)} value={type} />;
}

FileType.propTypes = {
  /**
   * File format
   */
  type: PropTypes.string,
  className: PropTypes.string,
};

export default FileType;
