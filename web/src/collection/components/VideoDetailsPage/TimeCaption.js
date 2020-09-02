import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AccessTimeOutlinedIcon from "@material-ui/icons/AccessTimeOutlined";
import { formatDuration } from "../../../common/helpers/format";

const useStyles = makeStyles((theme) => ({
  position: {
    ...theme.mixins.textSmall,
    color: theme.palette.common.white,
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing(0.5),
  },
}));

/**
 * Represent a time position inside a video file.
 */
function TimeCaption(props) {
  const { time, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.position, className)} {...other}>
      <AccessTimeOutlinedIcon className={classes.icon} fontSize="inherit" />
      {formatDuration(time, null, false)}
    </div>
  );
}

TimeCaption.propTypes = {
  /**
   * Time position in milliseconds
   */
  time: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default TimeCaption;
