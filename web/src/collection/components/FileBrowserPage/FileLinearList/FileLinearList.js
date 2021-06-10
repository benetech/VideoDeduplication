import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileLinearListItem from "./FileLinearListItem";
import FileLinearListLoadTrigger from "./FileLinearListLoadTrigger";

const useStyles = makeStyles(() => ({
  list: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

const FileLinearList = React.forwardRef(function FileLinearList(props, ref) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.list, className)} ref={ref} {...other}>
      {children}
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
