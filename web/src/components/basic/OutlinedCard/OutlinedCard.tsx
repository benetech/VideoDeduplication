import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  outlinedCard: {
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
  },
  borderBold: {
    borderWidth: 3,
    borderColor: theme.palette.border.light,
    borderStyle: "solid",
  },
  borderLean: {
    borderWidth: 1,
    borderColor: "rgba(103, 112, 131, 0.3)",
    borderStyle: "solid",
    "&:hover": {
      borderColor: "rgba(103, 112, 131, 0.5)",
    },
    transition: theme.transitions.create(["border-color", "background-color"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen / 2,
    }),
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
  border?: "bold" | "lean";
  className?: string;
};

function OutlinedCard(props: OutlinedCardProps): JSX.Element {
  const {
    selected = false,
    border = "bold",
    children,
    className,
    ...other
  } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.outlinedCard,
        selected && classes.selected,
        border === "bold" && classes.borderBold,
        border === "lean" && classes.borderLean,
        className
      )}
      {...other}
    >
      {children}
    </div>
  );
}

export default OutlinedCard;
