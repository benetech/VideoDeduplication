import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import PresetListItem from "./PresetListItem";
import Divider from "./Divider";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

function PresetList(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className)} {...other}>
      {children}
    </div>
  );
}

PresetList.Item = PresetListItem;
PresetList.Divider = Divider;

PresetList.propTypes = {
  /**
   * FilterContainer content.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default PresetList;
