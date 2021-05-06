import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  indent: {
    marginTop: theme.spacing(4),
  },
}));

/**
 * Set the following properties: selected, onSelect and value (if absent)
 */
function bindProps(classes) {
  return (filter, currentIndex) => {
    if (!React.isValidElement(filter)) {
      return null;
    }

    const first = currentIndex === 0;
    const className = clsx(!first && classes.indent, filter.props.className);

    return React.cloneElement(filter, {
      ...filter.props,
      className,
    });
  };
}

/**
 * Common layout for single filter tab.
 */
function FilterList(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();

  // Set required child properties
  const filters = React.Children.map(children, bindProps(classes));

  return (
    <div className={clsx(classes.root, className)} {...other}>
      {filters}
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
