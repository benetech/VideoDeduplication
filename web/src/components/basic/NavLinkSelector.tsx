import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, Theme } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import NavLink, { Link } from "./NavLink";
import usePopup from "../../lib/hooks/usePopup";
import Popover from "@material-ui/core/Popover";
import NavLinkList from "./NavLinkList";
import useUniqueId from "../../lib/hooks/useUniqueId";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

const useStyles = makeStyles<Theme>((theme) => ({
  selector: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    cursor: "pointer",
  },
  link: {
    flexGrow: 0,
  },
  popupContent: {
    padding: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
}));

/**
 * Drop-down menu style nav-link list.
 */
function NavLinkSelector(props: NavLinkSelectorProps): JSX.Element {
  const { selected, onSelect, links, className, ...other } = props;
  const classes = useStyles();
  const { popup, clickTrigger } = usePopup<HTMLButtonElement>();
  const handleSelect = useCallback(
    (link) => {
      popup.onClose();
      onSelect(link);
    },
    [onSelect]
  );
  const navLinkId = useUniqueId("nav-link-button");
  return (
    <div className={clsx(className)} {...other}>
      <ButtonBase
        {...clickTrigger}
        className={classes.selector}
        aria-labelledby={navLinkId}
        focusRipple
        disableTouchRipple
      >
        <NavLink
          id={navLinkId}
          link={selected}
          selected
          className={classes.link}
          tabIndex={-1}
        />
        <ExpandMoreIcon />
      </ButtonBase>
      <Popover {...popup}>
        <div className={classes.popupContent}>
          <NavLinkList
            selected={selected}
            links={links}
            onSelect={handleSelect}
            variant="vertical"
            decorate={false}
          />
        </div>
      </Popover>
    </div>
  );
}

type NavLinkSelectorProps = {
  onSelect: (...args: any[]) => void;
  selected: any;
  links: Link[];
  styles?: CSSProperties;
  className?: string;
};

export default NavLinkSelector;
