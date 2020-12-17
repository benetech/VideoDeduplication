import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    marginBottom: theme.spacing(1),
  },
}));

function ItemContainer(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)} {...other}>
      {children}
    </div>
  );
}

ItemContainer.propTypes = {
  /**
   * Container displayed contents.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default ItemContainer;
