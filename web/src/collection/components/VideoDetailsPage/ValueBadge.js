import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  type: {
    borderRadius: theme.spacing(0.25),
    backgroundColor: ({ color }) => theme.palette[color].light,
    ...theme.mixins.textSmall,
    color: ({ color }) => theme.palette[color].contrastText,
    textTransform: "uppercase",
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: "min-content",
  },
}));

function ValueBadge(props) {
  const { value, color = "primary", className } = props;
  const classes = useStyles({ color });
  return <div className={clsx(classes.type, className)}>{value}</div>;
}

ValueBadge.propTypes = {
  /**
   * Value which will be displayed.
   */
  value: PropTypes.string,
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
  ]),
  className: PropTypes.string,
};

export default ValueBadge;
