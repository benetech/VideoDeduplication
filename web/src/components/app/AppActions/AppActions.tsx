import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ConnectionIndicator from "./ConnectionIndicator";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import NotificationsNoneOutlinedIcon from "@material-ui/icons/NotificationsNoneOutlined";
import PlusButton from "./PlusButton";
import ProfileMenuButton from "./ProfileMenuButton";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import { routes } from "../../../routing/routes";
import WikiLink from "./WikiLink";

const useStyles = makeStyles<Theme>((theme) => ({
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
  wiki: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

function AppActions(props: AppActionsProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();
  const history = useHistory();
  const handleAddMedia = useCallback(
    () => history.push(routes.processing.home),
    []
  );
  const handleOpenWiki = useCallback(
    () => window.open(routes.external.wiki, "_blank"),
    []
  );
  return (
    <div className={clsx(classes.actions, className)}>
      <PlusButton onClick={handleAddMedia} />
      <ConnectionIndicator offline className={classes.indicator} />
      <Divider orientation="vertical" className={classes.divider} />
      <IconButton
        className={classes.notificationButton}
        aria-label={intl.formatMessage({
          id: "actions.showNotifications",
        })}
      >
        <NotificationsNoneOutlinedIcon />
      </IconButton>
      <Divider orientation="vertical" className={classes.divider} />
      <WikiLink onClick={handleOpenWiki} className={classes.wiki} />
      <Divider orientation="vertical" className={classes.divider} />
      <ProfileMenuButton className={classes.profileButton} />
    </div>
  );
}

type AppActionsProps = {
  className?: string;
};
export default AppActions;
