import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  outlinedCard: {
    borderWidth: 3,
    borderRadius: theme.spacing(1),
    borderColor: theme.palette.border.light,
    borderStyle: "solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
  },
  selected: {
    borderColor: theme.palette.border.dark,
  },
}));

type OutlinedCardProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  selected?: boolean;
  children?: React.ReactNode;
  className?: string;
};

function OutlinedCard(props: OutlinedCardProps): JSX.Element {
  const { selected = false, children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.outlinedCard,
        selected && classes.selected,
        className
      )}
      {...other}
    >
      {children}
    </div>
  );
}

export default OutlinedCard;
