import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  wikiLink: {
    fontFamily: "Roboto",
    fontSize: 15,
    letterSpacing: 0,
    cursor: "pointer",
    color: theme.palette.action.textInactive,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

function WikiLink(props) {
  const { onClick, className, ...other } = props;
  const classes = useStyles();
  return (
    <ButtonBase
      className={clsx(classes.wikiLink, className)}
      focusRipple
      onClick={onClick}
      {...other}
    >
      Wiki
    </ButtonBase>
  );
}

WikiLink.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default WikiLink;
