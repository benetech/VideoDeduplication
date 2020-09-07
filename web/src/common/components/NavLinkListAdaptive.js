import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import NavLinkList from "./NavLinkList";
import NavLinkSelector from "./NavLinkSelector";
import clsx from "clsx";
import { LinkType } from "./NavLink";

const breakpoints = ["xs", "sm", "md", "lg", "xl"];

function next(item, list) {
  const index = list.indexOf(item);
  return list[index + 1];
}

const useStyles = makeStyles((theme) => ({
  expanded: (props) => ({
    [theme.breakpoints.down(props.collapseOn)]: {
      display: "none",
    },
  }),
  collapsed: (props) => ({
    [theme.breakpoints.up(next(props.collapseOn, breakpoints))]: {
      display: "none",
    },
  }),
}));

function NavLinkListAdaptive(props) {
  const { selected, links, onSelect, className, ...other } = props;
  const classes = useStyles(props);
  return (
    <React.Fragment>
      <NavLinkList
        selected={selected}
        links={links}
        onSelect={onSelect}
        className={clsx(className, classes.expanded)}
        {...other}
      />
      <NavLinkSelector
        onSelect={onSelect}
        selected={selected}
        links={links}
        className={clsx(className, classes.collapsed)}
        {...other}
      />
    </React.Fragment>
  );
}

NavLinkListAdaptive.propTypes = {
  collapseOn: PropTypes.oneOf(breakpoints).isRequired,
  selected: PropTypes.any.isRequired,
  onSelect: PropTypes.func,
  links: PropTypes.arrayOf(LinkType).isRequired,
  className: PropTypes.string,
};

export default NavLinkListAdaptive;
