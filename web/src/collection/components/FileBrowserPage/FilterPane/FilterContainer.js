import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {},
  title: {
    ...theme.mixins.title4,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
}));

/**
 * Common layout for titled filters.
 */
function FilterContainer(props) {
  const { title, children, className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.title}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

FilterContainer.propTypes = {
  /**
   * FilterContainer title.
   */
  title: PropTypes.string.isRequired,
  /**
   * FilterContainer content.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default FilterContainer;
