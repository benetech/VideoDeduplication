import React, { useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileLinearListItem from "./FileLinearListItem";
import FileLinearListLoadTrigger from "./FileLinearListLoadTrigger";
import composeRefs from "@seznam/compose-react-refs";
import { useResizeDetector } from "react-resize-detector";

const useStyles = makeStyles(() => ({
  list: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

/**
 * Set the following properties: selected, onSelect and value (if absent)
 */
function bindProps(width) {
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
  props,
  externalRef
) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  const { width, ref } = useResizeDetector();
  const items = React.Children.map(children, bindProps(width));
  const composedRef = useMemo(() => composeRefs(ref, externalRef), [
    ref,
    externalRef,
  ]);

  return (
    <div className={clsx(classes.list, className)} ref={composedRef} {...other}>
      {items}
    </div>
  );
});

FileLinearList.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

// Access item type from the container type
FileLinearList.Item = FileLinearListItem;

// Access load trigger from the container type
FileLinearList.LoadTrigger = FileLinearListLoadTrigger;

export default FileLinearList;
