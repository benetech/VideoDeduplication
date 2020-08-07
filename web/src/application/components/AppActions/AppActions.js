import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ConnectionIndicator from "./ConnectionIndicator";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import NotificationsNoneOutlinedIcon from "@material-ui/icons/NotificationsNoneOutlined";
import AddIcon from "@material-ui/icons/Add";
import ProfileMenuButton from "./ProfileMenuButton";
import SquaredIconButton from "../../../common/components/SquaredIconButton";

const useStyles = makeStyles((theme) => ({
  actions: {
    display: "flex",
    alignItems: "center",
  },
  indicator: {
    margin: "0px 16px 0px 16px",
    alignSelf: "stretch",
  },
  divider: {
    minHeight: 30,
  },
  plus: {
    width: 35,
    height: 35,
    minWidth: 35,
  },
  notificationButton: {
    color: theme.palette.common.black,
    marginLeft: theme.spacing(1.3),
    marginRight: theme.spacing(1.3),
  },
  profileButton: {
    color: theme.palette.common.black,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));

function AppActions(props) {
  const { className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.actions, className)}>
      <SquaredIconButton
        color="primary"
        variant="contained"
        className={classes.plus}
      >
        <AddIcon />
      </SquaredIconButton>
      <ConnectionIndicator offline className={classes.indicator} />
      <Divider orientation="vertical" className={classes.divider} />
      <IconButton className={classes.notificationButton}>
        <NotificationsNoneOutlinedIcon />
      </IconButton>
      <Divider orientation="vertical" className={classes.divider} />
      <ProfileMenuButton className={classes.profileButton} />
    </div>
  );
}

AppActions.propTypes = {
  className: PropTypes.string,
};

export default AppActions;
