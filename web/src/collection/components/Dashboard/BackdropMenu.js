import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Backdrop from "../../../common/components/Backdrop";

const useStyles = makeStyles((theme) => ({
  close: {
    display: "none",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
  },
  action: {
    ...theme.mixins.title1,
    fontWeight: "bold",
    color: theme.palette.secondary.main,
    "&:hover": {
      color: theme.palette.primary.main,
    },
    cursor: "pointer",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

function doSeq(...actions) {
  return () => actions.forEach((action) => action());
}

function BackdropMenu(props) {
  const { open, onClose, actions, className } = props;
  const classes = useStyles();

  return (
    <Backdrop className={clsx(className, !open && classes.close)}>
      <ClickAwayListener
        mouseEvent={open ? "onClick" : false}
        onClickAway={onClose}
      >
        <div className={classes.menu}>
          {actions.map((action) => (
            <div
              className={classes.action}
              onClick={doSeq(onClose, action.handler)}
              key={action.title}
            >
              {action.title}
            </div>
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
