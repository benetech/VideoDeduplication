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
  },
  grow: {
    flexGrow: 1,
  },
}));

function Title(props) {
  const { text, children, grow = false, className, ...other } = props;
  const classes = useStyles();

  return (
    <div className={clsx(classes.header, className)} {...other}>
      <div className={clsx(classes.title, grow && classes.grow)}>{text}</div>
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
  /**
   * Control title horizontal stretching.
   */
  grow: PropTypes.bool,
  className: PropTypes.string,
};

export default Title;
