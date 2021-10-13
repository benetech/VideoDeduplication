import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { ColorVariant } from "../../lib/types/ColorVariant";
import { Theme } from "@material-ui/core";

type ValueBadgeStyleProps = {
  color: ColorVariant;
};

const useStyles = makeStyles<Theme, ValueBadgeStyleProps>((theme) => ({
  type: {
    borderRadius: theme.spacing(0.25),
    backgroundColor: ({ color }) => theme.palette[color].light,
    ...theme.mixins.textSmall,
    color: ({ color }) => theme.palette[color].contrastText,
    textTransform: "uppercase",
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: "min-content",
  },
}));

function ValueBadge(props: ValueBadgePros): JSX.Element {
  const { value, color = "primary", className } = props;
  const classes = useStyles({ color });
  return <div className={clsx(classes.type, className)}>{value}</div>;
}

type ValueBadgePros = {
  /**
   * Value which will be displayed.
   */
  value: string;
  color?: ColorVariant;
  className?: string;
};

export default ValueBadge;
