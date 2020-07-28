import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import NavLink from "./NavLink";
import usePopup from "../hooks/usePopup";
import Popover from "@material-ui/core/Popover";
import NavLinkList from "./NavLinkList";

const useStyles = makeStyles((theme) => ({
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
function NavLinkSelector(props) {
  const { selected, onSelect, links, className } = props;
  const classes = useStyles();
  const { popup, clickTrigger } = usePopup();

  const handleSelect = useCallback(
    (link) => {
      popup.onClose();
      onSelect(link);
    },
    [onSelect]
  );

  return (
    <div className={clsx(className)}>
      <div {...clickTrigger} className={classes.selector}>
        <NavLink link={selected} selected className={classes.link} />
        <ExpandMoreIcon />
      </div>
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

NavLinkSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  selected: PropTypes.any.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  styles: PropTypes.object,
  className: PropTypes.string,
};

export default NavLinkSelector;
