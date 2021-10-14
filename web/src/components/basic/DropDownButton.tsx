import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ButtonBase from "@material-ui/core/ButtonBase";
import useUniqueId from "../../lib/hooks/useUniqueId";

const useStyles = makeStyles<Theme>((theme) => ({
  button: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  title: {
    ...theme.mixins.title1,
    ...theme.mixins.noselect,
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
  icon: { ...theme.mixins.title1, marginLeft: theme.spacing(1) },
}));

function DropDownButton(props: DropDownButtonProps): JSX.Element {
  const { title, onClick, className, ...other } = props;
  const classes = useStyles();
  const titleId = useUniqueId("dropdown-button-title");
  return (
    <ButtonBase
      onClick={onClick}
      className={clsx(classes.button, className)}
      focusRipple
      disableTouchRipple
      aria-labelledby={titleId}
      {...other}
    >
      <span id={titleId} className={classes.title}>
        {title}
      </span>
      <ExpandMoreIcon className={classes.icon} />
    </ButtonBase>
  );
}

type DropDownButtonProps = {
  title: string;
  onClick?: (...args: any[]) => void;
  className?: string;
};
export default DropDownButton;
