import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppMenuList from "./AppMenuList";
import AppMenuListItem from "./AppMenuListItem";

import LayersOutlinedIcon from "@material-ui/icons/LayersOutlined";
import PersonOutlinedIcon from "@material-ui/icons/PersonOutlined";
import ImageSearchOutlinedIcon from "@material-ui/icons/ImageSearchOutlined";
import CompareOutlinedIcon from "@material-ui/icons/CompareOutlined";
import BarChartOutlinedIcon from "@material-ui/icons/BarChartOutlined";
import AppMenuHeader from "./AppMenuHeader";
import { useIntl } from "react-intl";
import { routes } from "../../../routing/routes";
import { useHistory, useLocation } from "react-router-dom";
import useUniqueId from "../../../common/hooks/useUniqueId";

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
    icon: <BarChartOutlinedIcon fontSize="large" />,
    title: "nav.dashboard",
    location: routes.analytics.home,
  },
  {
    icon: <LayersOutlinedIcon fontSize="large" />,
    title: "nav.collection",
    location: routes.collection.home,
  },
  {
    icon: <PersonOutlinedIcon fontSize="large" />,
    title: "nav.collaborators",
    location: routes.collaborators.home,
  },
  {
    icon: <ImageSearchOutlinedIcon fontSize="large" />,
    title: "nav.templates",
    location: routes.templates.home,
  },
  {
    icon: <CompareOutlinedIcon fontSize="large" />,
    title: "nav.processing",
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

function getStyles(classes, open, className) {
  return clsx(
    classes.drawer,
    {
      [classes.drawerOpen]: open,
      [classes.drawerClose]: !open,
    },
    className
  );
}

function AppMenu(props) {
  const { className } = props;
  const [open, setOpen] = useState(true);
  const selected = useCurrentLink(menuItems);
  const setSelected = useSelectPage();
  const intl = useIntl();
  const id = useUniqueId("app-sidebar");

  const classes = useStyles();
  return (
    <div
      id={id}
      role="navigation"
      aria-label={intl.formatMessage({ id: "aria.label.sidebar" })}
      className={getStyles(classes, open, className)}
      data-selector="AppMenu"
    >
      <AppMenuList className={classes.links}>
        <AppMenuHeader
          open={open}
          onToggle={() => setOpen(!open)}
          aria-controls={id}
        />
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
