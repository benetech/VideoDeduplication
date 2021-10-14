import React from "react";
import clsx from "clsx";
import { ClassNameMap, makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
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
function bindProps(
  classes: ClassNameMap
): (filter: React.ReactNode, index: number) => React.ReactNode {
  return (filter, currentIndex) => {
    if (!React.isValidElement(filter)) {
      return null;
    }

    const first = currentIndex === 0;
    const className = clsx(!first && classes.indent, filter.props.className);
    return React.cloneElement(filter, { ...filter.props, className });
  };
}
/**
 * Common layout for single filter tab.
 */

function FilterList(props: FilterListProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles(); // Set required child properties

  const filters = React.Children.map(children, bindProps(classes));
  return (
    <div className={clsx(classes.root, className)} {...other}>
      {filters}
    </div>
  );
}

type FilterListProps = {
  /**
   * FilterContainer content.
   */
  children?: React.ReactNode;
  className?: string;
};
export default FilterList;
