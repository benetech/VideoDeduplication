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

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  drawer: {
    width: theme.mixins.drawer.width,
    backgroundColor: theme.palette.background.paper,
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "end",
    borderRight: "hidden",
    position: "relative",
    height: "100%",
    minHeight: "min-content",
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
  },
}));

const menuItems = [
  {
    icon: <LayersOutlinedIcon fontSize="large" />,
    title: "app.menu.collection",
  },
  {
    icon: <GrainOutlinedIcon fontSize="large" />,
    title: "app.menu.database",
  },
  {
    icon: <PersonOutlinedIcon fontSize="large" />,
    title: "app.menu.collaborators",
  },
  {
    icon: <AccountTreeOutlinedIcon fontSize="large" />,
    title: "app.menu.organization",
  },
  {
    icon: <CompareOutlinedIcon fontSize="large" />,
    title: "app.menu.processing",
  },
];

function AppMenu(props) {
  const { className } = props;
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState(0);
  const intl = useIntl();

  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className)}>
      <div
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
      >
        <AppMenuList className={classes.links}>
          <AppMenuHeader open={open} onToggle={() => setOpen(!open)} />
          {menuItems.map((item, index) => (
            <AppMenuListItem
              icon={item.icon}
              title={intl.formatMessage({ id: item.title })}
              selected={index === selected}
              onClick={() => setSelected(index)}
              collapsed={!open}
              key={index}
            />
          ))}
        </AppMenuList>
      </div>
    </div>
  );
}

AppMenu.propTypes = {
  className: PropTypes.string,
};

export default AppMenu;
