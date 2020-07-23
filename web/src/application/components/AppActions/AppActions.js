import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ConnectionIndicator from "./ConnectionIndicator";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import NotificationsNoneOutlinedIcon from "@material-ui/icons/NotificationsNoneOutlined";
import PersonOutlinedIcon from "@material-ui/icons/PersonOutlined";
import PlusButton from "./PlusButton";

const useStyles = makeStyles((theme) => ({
  actions: {
    display: "flex",
    alignItems: "center",
  },
  indicator: {
    margin: "0px 12px 0px 12px",
    alignSelf: "stretch",
  },
  divider: {
    minHeight: 35,
  },
  button: {
    color: theme.palette.common.black,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

function AppActions(props) {
  const { className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.actions, className)}>
      <PlusButton />
      <ConnectionIndicator offline className={classes.indicator} />
      <Divider orientation="vertical" className={classes.divider} />
      <IconButton className={classes.button}>
        <NotificationsNoneOutlinedIcon />
      </IconButton>
      <Divider orientation="vertical" className={classes.divider} />
      <IconButton className={classes.button}>
        <PersonOutlinedIcon />
      </IconButton>
    </div>
  );
}

AppActions.propTypes = {
  className: PropTypes.string,
};

export default AppActions;
