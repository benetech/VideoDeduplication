import React from "react";
import { makeStyles } from "@material-ui/styles";
import NavLinkList from "./NavLinkList";
import NavLinkSelector from "./NavLinkSelector";
import clsx from "clsx";
import { Breakpoint, breakpoints } from "../../lib/types/Breakpoint";
import { Link } from "./NavLink";
import { Theme } from "@material-ui/core";

function next<T>(item: T, list: T[]): T {
  const index = list.indexOf(item);
  return list[index + 1];
}

const useStyles = makeStyles<Theme, NavLinkListAdaptiveProps>((theme) => ({
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

function NavLinkListAdaptive(props: NavLinkListAdaptiveProps): JSX.Element {
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

type NavLinkListAdaptiveProps = React.HTMLProps<HTMLDivElement> & {
  collapseOn: Breakpoint;
  selected: Link;
  onSelect: (link: Link) => void;
  links: Link[];
  className?: string;
};

export default NavLinkListAdaptive;
