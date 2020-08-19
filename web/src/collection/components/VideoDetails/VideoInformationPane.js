import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FingerprintType } from "../Fingerprints/type";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  title: {
    ...theme.mixins.title4,
    fontWeight: "bold",
    padding: theme.spacing(2),
  },
  player: {},
}));

function VideoInformationPane(props) {
  const { className } = props;
  const classes = useStyles();
  return (
    <Paper className={clsx(classes.root, className)}>
      <div className={classes.title}>Video Information</div>
    </Paper>
  );
}

VideoInformationPane.propTypes = {
  file: FingerprintType.isRequired,
  className: PropTypes.string,
};

export default VideoInformationPane;
