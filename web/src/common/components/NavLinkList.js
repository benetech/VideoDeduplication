import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import NavLink from "./NavLink";

const useStyles = makeStyles((theme) => ({
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

function handleSelect(handler, link) {
  return () => handler(link);
}

function NavLinkList(props) {
  const {
    links,
    selected,
    onSelect,
    variant = "horizontal",
    decorate = true,
    className,
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
    >
      {links.map((link) => (
        <NavLink
          title={link.title}
          selected={link.title === selected}
          onClick={handleSelect(onSelect, link)}
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

NavLinkList.propTypes = {
  variant: PropTypes.oneOf(["horizontal", "vertical"]),
  selected: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
    })
  ),
  decorate: PropTypes.bool,
  className: PropTypes.string,
};

export default NavLinkList;
