import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  groupList: {
    display: "flex",
    flexDirection: "column",
  },
});

function ObjectGroupList(props) {
  const { children: groups, className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.groupList, className)}>{groups}</div>;
}

ObjectGroupList.propTypes = {
  /**
   * Object group array
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default ObjectGroupList;
