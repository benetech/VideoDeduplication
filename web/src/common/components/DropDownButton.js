import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
  const { title, onClick, className } = props;
  const classes = useStyles();
  return (
    <div onClick={onClick} className={clsx(classes.button, className)}>
      <div className={classes.title}>{title}</div>
      <ExpandMoreIcon className={classes.icon} />
    </div>
  );
}

DropDownButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default DropDownButton;
