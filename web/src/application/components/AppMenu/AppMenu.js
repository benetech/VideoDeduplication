import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppMenuList from "./AppMenuList";
import AppMenuListItem from "./AppMenuListItem";

import LayersOutlinedIcon from "@material-ui/icons/LayersOutlined";
import PersonOutlinedIcon from "@material-ui/icons/PersonOutlined";
import GrainOutlinedIcon from "@material-ui/icons/GrainOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import CompareOutlinedIcon from "@material-ui/icons/CompareOutlined";
import AppMenuHeader from "./AppMenuHeader";
import { useIntl } from "react-intl";
import { routes } from "../../../routing/routes";
import { useHistory, useLocation } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: theme.mixins.drawer.width,
    backgroundColor: theme.palette.background.paper,
  },
  drawerOpen: {
    width: theme.mixins.drawer.width,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    width: theme.dimensions.list.collapseWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  links: {
    width: theme.mixins.drawer.width,
    position: "sticky",
    top: 0,
  },
}));

const menuItems = [
  {
    icon: <LayersOutlinedIcon fontSize="large" />,
    title: "app.menu.collection",
    location: routes.collection.home,
  },
  {
    icon: <GrainOutlinedIcon fontSize="large" />,
    title: "app.menu.database",
    location: routes.database.home,
  },
  {
    icon: <PersonOutlinedIcon fontSize="large" />,
    title: "app.menu.collaborators",
    location: routes.collaborators.home,
  },
  {
    icon: <AccountTreeOutlinedIcon fontSize="large" />,
    title: "app.menu.organization",
    location: routes.organization.home,
  },
  {
    icon: <CompareOutlinedIcon fontSize="large" />,
    title: "app.menu.processing",
    location: routes.processing.home,
  },
];

function useCurrentLink(links) {
  let pathname = useLocation().pathname;
  return links.find((link) => pathname.startsWith(link.location));
}

function useSelectPage() {
  const history = useHistory();
  return (link) => history.push(link.location);
}

function AppMenu(props) {
  const { className } = props;
  const [open, setOpen] = useState(true);
  const selected = useCurrentLink(menuItems);
  const setSelected = useSelectPage();
  const intl = useIntl();

  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.drawer,
        {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        },
        className
      )}
    >
      <AppMenuList className={classes.links}>
        <AppMenuHeader open={open} onToggle={() => setOpen(!open)} />
        {menuItems.map((item, index) => (
          <AppMenuListItem
            icon={item.icon}
            title={intl.formatMessage({ id: item.title })}
            selected={selected && item.location === selected.location}
            onClick={() => setSelected(item)}
            collapsed={!open}
            key={index}
          />
        ))}
      </AppMenuList>
    </div>
  );
}

AppMenu.propTypes = {
  className: PropTypes.string,
};

export default AppMenu;
