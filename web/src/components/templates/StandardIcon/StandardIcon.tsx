import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import * as GameIcon from "react-icons/gi";
import CancelPresentationOutlinedIcon from "@material-ui/icons/CancelPresentationOutlined";
import clsx from "clsx";
import { IconType } from "react-icons/lib";
import { Attributes } from "../../../lib/types/TextAttributes";

const useStyles = makeStyles<Theme>({
  defaultIcon: {
    width: 40,
    height: 40,
    fontSize: 40,
  },
});

function StandardIcon(props: StandardIconProps): JSX.Element {
  const { name, className, ...other } = props;
  const classes = useStyles();
  const gameIcon = (GameIcon as Attributes<IconType>)[name];
  const iconDiv =
    gameIcon != null ? (
      React.createElement(gameIcon)
    ) : (
      <CancelPresentationOutlinedIcon />
    );
  return (
    <div className={clsx(classes.defaultIcon, className)} {...other}>
      {iconDiv}
    </div>
  );
}

type StandardIconProps = {
  /**
   * Icon name.
   */
  name: string;
  className?: string;
};
export default StandardIcon;
