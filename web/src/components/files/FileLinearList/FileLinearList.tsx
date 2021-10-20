import React, { useMemo } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import composeRefs from "@seznam/compose-react-refs";
import { useResizeDetector } from "react-resize-detector";
import { FileListProps } from "../FileList";

const useStyles = makeStyles<Theme>(() => ({
  list: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
}));
/**
 * Set the following properties: selected, onSelect and value (if absent)
 */

function bindProps(
  width: number
): (listItem: React.ReactNode) => React.ReactNode | null {
  return (listItem) => {
    if (!React.isValidElement(listItem)) {
      return null;
    }

    return React.cloneElement(listItem, {
      dense: width < 900,
      ...listItem.props,
    });
  };
}

const FileLinearList = React.forwardRef(function FileLinearList(
  props: FileListProps,
  externalRef: React.ForwardedRef<HTMLDivElement>
) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  const { width, ref } = useResizeDetector({
    handleHeight: false,
  });
  const items = React.Children.map(children, bindProps(width || 1));
  const composedRef = useMemo(
    () => composeRefs<HTMLDivElement>(ref, externalRef),
    [ref, externalRef]
  );
  return (
    <div className={clsx(classes.list, className)} ref={composedRef} {...other}>
      {items}
    </div>
  );
});

export default FileLinearList;
