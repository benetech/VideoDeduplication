import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SelectionDecorator from "./SelectionDecorator";

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    padding: "5px 4px 8px 4px",
    cursor: "pointer",
    /**
     * Ensure selection decorator is displayed correctly.
     */
    transform: "translate(0%, 0px)",
  },
  textSelected: {
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  textUnselected: {
    fontWeight: "normal",
    color: theme.palette.common.black,
  },
  /**
   * Wrap link text in additional component to ensure
   * it's total width doesn't change when font weight
   * changes.
   */
  text: {
    ...theme.mixins.navlink,
    display: "inline-block",
    textAlign: "center",
    /**
     * Reserve space for bolded content in ::before
     * pseudo element.
     */
    "&::before": {
      ...theme.mixins.navlink,
      fontWeight: "bold",
      display: "block",
      content: "attr(title)",
      height: 0,
      overflow: "hidden",
      visibility: "hidden",
    },
  },
}));

/**
 * Single navigation link.
 *
 * @see HeaderLinks
 */
function HeaderLink(props) {
  const { title, selected, onClick, className } = props;
  const classes = useStyles();

  const decorator = selected ? <SelectionDecorator variant="bottom" /> : null;

  return (
    <div className={clsx(classes.container, className)} onClick={onClick}>
      <div className={classes.link}>
        <div
          title={title}
          className={clsx(classes.text, {
            [classes.textSelected]: selected,
            [classes.textUnselected]: !selected,
          })}
        >
          {title}
        </div>
        {decorator}
      </div>
    </div>
  );
}

HeaderLink.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  className: PropTypes.string,
};

export default HeaderLink;
