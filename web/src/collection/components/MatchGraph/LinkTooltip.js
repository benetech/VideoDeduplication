import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Distance from "../../../common/components/Distance";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
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
  }),
  className: PropTypes.string,
};

export default LinkTooltip;
