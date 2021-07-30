import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Distance from "../../basic/Distance";
import Paper from "@material-ui/core/Paper";
import FileType from "../../../prop-types/FileType";
import FileTooltip from "./tooltip/FileTooltip";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
  },
  file: {
    paddingBottom: theme.spacing(1),
  },
  distance: {
    minWidth: 200,
  },
}));

function LinkTooltip(props) {
  const { link, className, ...other } = props;
  const classes = useStyles();

  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      <FileTooltip file={link.source.file} className={classes.file} />
      <FileTooltip file={link.target.file} className={classes.file} />
      <Distance value={link.distance} dense className={classes.distance} />
    </Paper>
  );
}

LinkTooltip.propTypes = {
  /**
   * Link being summarized.
   */
  link: PropTypes.shape({
    distance: PropTypes.number.isRequired,
    source: FileType.isRequired,
    target: FileType.isRequired,
  }),
  className: PropTypes.string,
};

export default LinkTooltip;
