import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Backdrop from "../../../components/basic/Backdrop";
import BackdropMenuItem from "./BackdropMenuItem";
import Action from "../../../model/Action";

const useStyles = makeStyles<Theme>(() => ({
  close: {
    display: "none",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
  },
}));

function BackdropMenu(props: BackdropMenuProps): JSX.Element {
  const { open, onClose, actions, className, ...other } = props;
  const classes = useStyles();
  return (
    <Backdrop className={clsx(className, !open && classes.close)}>
      <ClickAwayListener
        mouseEvent={open ? "onClick" : false}
        onClickAway={onClose}
      >
        <div
          className={classes.menu}
          role="menu"
          aria-expanded={open}
          {...other}
        >
          {actions.map((action) => (
            <BackdropMenuItem
              action={action}
              key={action.title}
              onClose={onClose}
            />
          ))}
        </div>
      </ClickAwayListener>
    </Backdrop>
  );
}

type BackdropMenuProps = {
  open?: boolean;
  onClose: () => void;
  actions: Action[];
  className?: string;
};
export default BackdropMenu;
