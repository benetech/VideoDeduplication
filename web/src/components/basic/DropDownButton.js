import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ButtonBase from "@material-ui/core/ButtonBase";
import useUniqueId from "../../lib/hooks/useUniqueId";

const useStyles = makeStyles((theme) => ({
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
  icon: {
    ...theme.mixins.title1,
    marginLeft: theme.spacing(1),
  },
}));

function DropDownButton(props) {
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

DropDownButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default DropDownButton;
