import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Backdrop from "../../../../common/components/Backdrop";
import BackdropMenuItem from "./BackdropMenuItem";

const useStyles = makeStyles(() => ({
  close: {
    display: "none",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
  },
}));

function BackdropMenu(props) {
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

BackdropMenu.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      handler: PropTypes.func.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default BackdropMenu;
