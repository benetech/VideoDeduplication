import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { IconButton } from "@material-ui/core";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";

function CollapseButton(props) {
  const { collapsed, onClick, className, ...other } = props;
  const Icon = collapsed ? ExpandMoreOutlinedIcon : ExpandLessOutlinedIcon;

  return (
    <IconButton onClick={onClick} className={clsx(className)} {...other}>
      <Icon />
    </IconButton>
  );
}

CollapseButton.propTypes = {
  /**
   * Button state (collapsed or not).
   */
  collapsed: PropTypes.bool,
  /**
   * Mouse click handler.
   */
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default CollapseButton;
