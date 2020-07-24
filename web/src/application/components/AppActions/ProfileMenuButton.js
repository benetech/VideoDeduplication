import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import PersonOutlinedIcon from "@material-ui/icons/PersonOutlined";

const useStyles = makeStyles((theme) => ({
  button: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    minHeight: 48,
    borderRadius: 24,
  },
  profileIcon: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

function ProfileMenuButton(props) {
  const { className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.button, className)}>
      <PersonOutlinedIcon className={classes.profileIcon} />
      <ArrowDropDownIcon />
    </div>
  );
}

ProfileMenuButton.propTypes = {
  className: PropTypes.string,
};

export default ProfileMenuButton;
