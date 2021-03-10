import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  title: {
    ...theme.mixins.title0,
    marginRight: theme.spacing(5),
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      flexGrow: 1,
    },
  },
}));

function Title(props) {
  const { text, children, className, ...other } = props;
  const classes = useStyles();

  return (
    <div className={clsx(classes.header, className)} {...other}>
      <div className={classes.title}>{text}</div>
      {children}
    </div>
  );
}

Title.propTypes = {
  /**
   * Text to be displayed.
   */
  text: PropTypes.string,
  /**
   * Additional title elements and decorations.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default Title;
