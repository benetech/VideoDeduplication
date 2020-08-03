import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  button: {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    ...theme.mixins.noselect,
    padding: `${theme.spacing(3)}px ${theme.spacing(2)}px`,
    cursor: "pointer",
    border: "solid",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0)",
  },
  icon: {
    marginRight: theme.spacing(1.5),
  },
  selected: {
    border: "solid",
    borderWidth: 1,
    borderColor: theme.palette.primary.main,
  },
  name: {
    flexGrow: 1,
    ...theme.mixins.title3,
    display: "inline-block",
    whiteSpace: "nowrap",
    /**
     * Reserve space for bolded content in ::before
     * pseudo element.
     */
    "&::before": {
      ...theme.mixins.title3,
      fontWeight: "bold",
      display: "block",
      content: "attr(title)",
      height: 0,
      overflow: "hidden",
      visibility: "hidden",
    },
  },
  nameSelected: {
    fontWeight: "bold",
  },
  quantity: {
    ...theme.mixins.title3,
    color: theme.palette.action.textInactive,
    fontWeight: "normal",
  },
}));

function CategoryButton(props) {
  const { name, icon: Icon, quantity, selected, onClick, className } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.button,
        { [classes.selected]: selected },
        className
      )}
      onClick={onClick}
    >
      <Icon className={classes.icon} />
      <div
        title={name}
        className={clsx(classes.name, { [classes.nameSelected]: selected })}
      >
        {name}
      </div>
      <div className={classes.quantity}>{quantity}</div>
    </div>
  );
}

CategoryButton.propTypes = {
  onClick: PropTypes.func,
  name: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  selected: PropTypes.bool,
  quantity: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default CategoryButton;
