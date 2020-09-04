import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";

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
    width: "100%",
    outline: "none",
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
    ...theme.mixins.textEllipsis,
    ...theme.mixins.title3,
    display: "inline-block",
    whiteSpace: "nowrap",
    textAlign: "start",
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

// total span
const total = 12;

function CategoryButton(props) {
  const {
    name,
    icon: Icon,
    quantity,
    selected,
    onClick,
    dense,
    className,
  } = props;

  const classes = useStyles();

  // Items per row
  const items = {
    xl: 4,
    md: dense ? 2 : 4,
    xs: 2,
  };

  return (
    <Grid
      item
      xl={total / items.xl}
      md={total / items.md}
      xs={total / items.xs}
    >
      <button
        onClick={onClick}
        className={clsx(
          classes.button,
          { [classes.selected]: selected },
          className
        )}
      >
        <Icon className={classes.icon} />
        <span
          title={name}
          className={clsx(classes.name, { [classes.nameSelected]: selected })}
        >
          {name}
        </span>
        <span className={classes.quantity}>{quantity}</span>
      </button>
    </Grid>
  );
}

CategoryButton.propTypes = {
  dense: PropTypes.bool,
  onClick: PropTypes.func,
  name: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  selected: PropTypes.bool,
  quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  className: PropTypes.string,
};

export default CategoryButton;
