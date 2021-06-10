import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import FileGridListItem from "./FileGridListItem";
import FileGridListLoadTrigger from "./FileGridListLoadTrigger";
import { useResizeDetector } from "react-resize-detector";

/**
 * Set the following properties: selected, onSelect and value (if absent)
 */
function bindProps(perRow) {
  return (listItem) => {
    if (!React.isValidElement(listItem)) {
      return null;
    }
    return React.cloneElement(listItem, { perRow, ...listItem.props });
  };
}

function useRow(minItemWidth, defaultRow = 3) {
  const { width, ref } = useResizeDetector();
  let perRow = Math.floor(width / minItemWidth);
  return {
    ref,
    perRow: isFinite(perRow) ? perRow : defaultRow,
  };
}

function FileGridList(props) {
  const { children, className } = props;
  const minItemWidth = 272;
  const { perRow, ref } = useRow(minItemWidth);
  const items = React.Children.map(children, bindProps(perRow));

  return (
    <Grid container spacing={5} className={clsx(className)} ref={ref}>
      {items}
    </Grid>
  );
}

FileGridList.propTypes = {
  /**
   * List items.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

// Access item type from container type.
FileGridList.Item = FileGridListItem;

// Access loading trigger from container type
FileGridList.LoadTrigger = FileGridListLoadTrigger;

export default FileGridList;
