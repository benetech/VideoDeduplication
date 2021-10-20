import React, { useMemo } from "react";
import Grid from "@material-ui/core/Grid";
import { useResizeDetector } from "react-resize-detector";
import composeRefs from "@seznam/compose-react-refs/composeRefs";
import { FileListProps } from "../FileList";

/**
 * Set the following properties: selected, onSelect and value (if absent)
 */
function bindProps(
  perRow: number
): (listItem: React.ReactNode) => React.ReactNode {
  return (listItem) => {
    if (!React.isValidElement(listItem)) {
      return null;
    }

    return React.cloneElement(listItem, {
      perRow,
      ...listItem.props,
    });
  };
}

function useRow(minItemWidth: number, defaultRow = 3) {
  const { width, ref } = useResizeDetector({
    handleHeight: false,
  });
  const perRow = Math.floor((width || 0) / minItemWidth);
  return {
    ref,
    perRow: isFinite(perRow) ? perRow : defaultRow,
  };
}

const FileGridList = React.forwardRef(function FileGridList(
  props: FileListProps,
  externalRef: React.ForwardedRef<HTMLDivElement>
) {
  const { children, className, ...other } = props;
  const minItemWidth = 272;
  const { perRow, ref: gridRef } = useRow(minItemWidth);
  const items = React.Children.map(children, bindProps(perRow));
  const ref = useMemo(
    () => composeRefs<HTMLDivElement>(gridRef, externalRef),
    [gridRef, externalRef]
  );
  return (
    <Grid container spacing={5} ref={ref} className={className} {...other}>
      {items}
    </Grid>
  );
});

export default FileGridList;
