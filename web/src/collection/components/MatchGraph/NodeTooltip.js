import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileType from "../../prop-types/FileType";
import Paper from "@material-ui/core/Paper";
import FileTooltip from "./tooltip/FileTooltip";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
  },
}));

function NodeTooltip(props) {
  const { file, className, ...other } = props;
  const classes = useStyles();

  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      <FileTooltip file={file} />
    </Paper>
  );
}

NodeTooltip.propTypes = {
  /**
   * File to be summarized.
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default NodeTooltip;
