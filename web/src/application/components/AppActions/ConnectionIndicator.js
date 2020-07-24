import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import WifiOffOutlinedIcon from "@material-ui/icons/WifiOffOutlined";
import WifiOutlinedIcon from "@material-ui/icons/WifiOutlined";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  indicator: {
    display: "flex",
    alignItems: "center",
    fontFamily: "Roboto",
    fontSize: 15,
    letterSpacing: 0,
    color: theme.palette.action.textInactive,
    cursor: "pointer",
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}));

function ConnectionIndicator(props) {
  const { offline = false, className } = props;
  const classes = useStyles();
  const intl = useIntl();

  const Icon = offline ? WifiOffOutlinedIcon : WifiOutlinedIcon;
  const text = offline
    ? intl.formatMessage({ id: "app.action.offline" })
    : intl.formatMessage({ id: "app.action.online" });

  return (
    <div className={clsx(classes.indicator, className)}>
      <Icon className={classes.icon} /> {text}
    </div>
  );
}

ConnectionIndicator.propTypes = {
  offline: PropTypes.bool,
  className: PropTypes.string,
};

export default ConnectionIndicator;
