import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { GridSize, Theme } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ButtonBase from "@material-ui/core/ButtonBase";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { SvgIconTypeMap } from "@material-ui/core/SvgIcon/SvgIcon";
import { ComponentType } from "../../../lib/types/ComponentType";

const useStyles = makeStyles<Theme>((theme) => ({
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
})); // total span

const total = 12;

function CategoryButton(props: CategoryButtonProps): JSX.Element {
  const {
    name,
    icon: Icon,
    quantity,
    selected,
    onClick,
    dense,
    className,
    ...other
  } = props;
  const classes = useStyles(); // Items per row

  const items = {
    xl: 4,
    md: dense ? 2 : 4,
    xs: 2,
  };
  return (
    <Grid
      item
      xl={(total / items.xl) as GridSize}
      md={(total / items.md) as GridSize}
      xs={(total / items.xs) as GridSize}
    >
      <ButtonBase
        onClick={onClick}
        className={clsx(
          classes.button,
          {
            [classes.selected]: selected,
          },
          className
        )}
        role="option"
        aria-label={name}
        aria-checked={selected}
        focusRipple
        disableTouchRipple
        component="div"
        {...other}
      >
        <Icon className={classes.icon} />
        <span
          title={name}
          className={clsx(classes.name, {
            [classes.nameSelected]: selected,
          })}
        >
          {name}
        </span>
        <span className={classes.quantity}>{quantity}</span>
      </ButtonBase>
    </Grid>
  );
}

type CategoryButtonProps = {
  dense?: boolean;
  onClick?: (...args: any[]) => void;
  name: string;
  icon: OverridableComponent<SvgIconTypeMap> | ComponentType;
  selected?: boolean;
  quantity: string | number;
  className?: string;
};
export default CategoryButton;
