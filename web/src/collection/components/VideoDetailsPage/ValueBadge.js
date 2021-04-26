import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  type: {
    borderRadius: theme.spacing(0.25),
    backgroundColor: theme.palette.primary.light,
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

function ValueBadge(props) {
  const { value, className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.type, className)}>{value}</div>;
}

ValueBadge.propTypes = {
  /**
   * Value which will be displayed.
   */
  value: PropTypes.string,
  className: PropTypes.string,
};

export default ValueBadge;
