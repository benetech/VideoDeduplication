import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

/**
 * Common layout for single filter tab.
 */
function FilterList(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className)} {...other}>
      {children}
    </div>
  );
}

FilterList.propTypes = {
  /**
   * FilterContainer content.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default FilterList;
