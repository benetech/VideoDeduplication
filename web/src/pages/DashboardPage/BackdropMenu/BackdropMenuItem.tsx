import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ButtonBase from "@material-ui/core/ButtonBase";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import Action from "../../../model/Action";

const useStyles = makeStyles<Theme>((theme) => ({
  item: {
    ...theme.mixins.title1,
    fontWeight: "bold",
    color: theme.palette.secondary.main,
    "&:hover": {
      color: theme.palette.primary.main,
    },
    cursor: "pointer",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    justifyContent: "flex-start",
  },
}));

type Callable = () => void;

function doSeq(...actions: Callable[]): Callable {
  return () => actions.forEach((action) => action());
}

function BackdropMenuItem(props: BackdropMenuItemProps): JSX.Element {
  const { action, onClose, className, ...other } = props;
  const classes = useStyles();
  const titleId = useUniqueId("menu-item-title");
  return (
    <ButtonBase
      className={clsx(classes.item, className)}
      onClick={doSeq(onClose, action.handler)}
      key={action.title}
      focusRipple
      disableTouchRipple
      aria-labelledby={titleId}
      role="menuitem"
      {...other}
    >
      <span id={titleId}>{action.title}</span>
    </ButtonBase>
  );
}

type BackdropMenuItemProps = {
  /**
   * Menu item action
   */
  action: Action;

  /**
   * Fire when menu should be closed
   */
  onClose: () => void;
  className?: string;
};
export default BackdropMenuItem;
