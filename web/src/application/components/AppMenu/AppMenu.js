import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Drawer from "@material-ui/core/Drawer";
import AppMenuList from "./AppMenuList";
import AppMenuListItem from "./AppMenuListItem";

import LayersOutlinedIcon from "@material-ui/icons/LayersOutlined";
import PersonOutlinedIcon from "@material-ui/icons/PersonOutlined";
import GrainOutlinedIcon from "@material-ui/icons/GrainOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import CompareOutlinedIcon from "@material-ui/icons/CompareOutlined";
import AppMenuHeader from "./AppMenuHeader";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  drawer: {
    width: theme.mixins.drawer.width,
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
    title: "My Collection",
  },
  {
    icon: <GrainOutlinedIcon fontSize="large" />,
    title: "Database",
  },
  {
    icon: <PersonOutlinedIcon fontSize="large" />,
    title: "Collaborators",
  },
  {
    icon: <AccountTreeOutlinedIcon fontSize="large" />,
    title: "Organization",
  },
  {
    icon: <CompareOutlinedIcon fontSize="large" />,
    title: "Processing",
  },
];

function AppMenu(props) {
  const { className } = props;
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState(0);

  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className)}>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <AppMenuList className={classes.links}>
          <AppMenuHeader open={open} onToggle={() => setOpen(!open)} />
          {menuItems.map((item, index) => (
            <AppMenuListItem
              icon={item.icon}
              title={item.title}
              selected={index === selected}
              onClick={() => setSelected(index)}
              collapsed={!open}
              key={index}
            />
          ))}
        </AppMenuList>
      </Drawer>
    </div>
  );
}

AppMenu.propTypes = {
  className: PropTypes.string,
};

export default AppMenu;
