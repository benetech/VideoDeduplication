import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import NavLink, { Link } from "./NavLink";

const useStyles = makeStyles<Theme>((theme) => ({
  links: {
    display: "flex",
  },
  variantVertical: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  variantHorizontal: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkHorizontal: {},
  linkVertical: {
    paddingBottom: theme.spacing(0.5),
  },
}));

function NavLinkList(props: NavLinkListProps): JSX.Element {
  const {
    links,
    selected,
    onSelect,
    variant = "horizontal",
    decorate = true,
    className,
    ...other
  } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.links,
        {
          [classes.variantHorizontal]: variant === "horizontal",
          [classes.variantVertical]: variant === "vertical",
        },
        className
      )}
      {...other}
    >
      {links.map((link) => (
        <NavLink
          link={link}
          selected={link.title === selected.title}
          onClick={onSelect}
          key={link.title}
          className={clsx({
            [classes.linkHorizontal]: variant === "horizontal",
            [classes.linkVertical]: variant === "vertical",
          })}
          decorated={decorate}
        />
      ))}
    </div>
  );
}

type NavLinkListProps = React.HTMLProps<HTMLDivElement> & {
  variant?: "horizontal" | "vertical";
  selected: any;
  onSelect?: (link: Link) => void;
  links: Link[];
  decorate?: boolean;
  className?: string;
};
export default NavLinkList;
