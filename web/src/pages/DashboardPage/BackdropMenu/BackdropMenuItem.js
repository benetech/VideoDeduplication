import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ButtonBase from "@material-ui/core/ButtonBase";
import useUniqueId from "../../../lib/hooks/useUniqueId";

const useStyles = makeStyles((theme) => ({
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

function doSeq(...actions) {
  return () => actions.forEach((action) => action());
}

function BackdropMenuItem(props) {
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

BackdropMenuItem.propTypes = {
  /**
   * Menu item action
   */
  action: PropTypes.shape({
    title: PropTypes.string.isRequired,
    handler: PropTypes.func.isRequired,
  }),
  /**
   * Fire when menu should be closed
   */
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default BackdropMenuItem;
