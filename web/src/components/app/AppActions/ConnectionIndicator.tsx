import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import WifiOffOutlinedIcon from "@material-ui/icons/WifiOffOutlined";
import WifiOutlinedIcon from "@material-ui/icons/WifiOutlined";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>((theme) => ({
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

function ConnectionIndicator(props: ConnectionIndicatorProps): JSX.Element {
  const { online = false, className } = props;
  const classes = useStyles();
  const intl = useIntl();
  const Icon = online ? WifiOutlinedIcon : WifiOffOutlinedIcon;
  const text = online
    ? intl.formatMessage({
        id: "app.action.online",
      })
    : intl.formatMessage({
        id: "app.action.offline",
      });
  return (
    <div className={clsx(classes.indicator, className)}>
      <Icon className={classes.icon} /> {text}
    </div>
  );
}

type ConnectionIndicatorProps = {
  online?: boolean;
  className?: string;
};
export default ConnectionIndicator;
