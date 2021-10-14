import React from "react";
import clsx from "clsx";
import { IconButton } from "@material-ui/core";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import { IconButtonProps } from "@material-ui/core/IconButton/IconButton";

function CollapseButton(props: CollapseButtonProps): JSX.Element {
  const { collapsed, onClick, className, ...other } = props;
  const Icon = collapsed ? ExpandMoreOutlinedIcon : ExpandLessOutlinedIcon;
  return (
    <IconButton onClick={onClick} className={clsx(className)} {...other}>
      <Icon />
    </IconButton>
  );
}

type CollapseButtonProps = IconButtonProps & {
  /**
   * Button state (collapsed or not).
   */
  collapsed?: boolean;
};
export default CollapseButton;
