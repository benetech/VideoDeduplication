import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  type: {
    borderRadius: theme.spacing(0.25),
    backgroundColor: "#E691A1",
    ...theme.mixins.textSmall,
    color: theme.palette.common.white,
    textTransform: "uppercase",
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: "min-content",
  },
}));

function FileType(props) {
  const { type, className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.type, className)}>{type}</div>;
}

FileType.propTypes = {
  /**
   * File format
   */
  type: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default FileType;
