import React from "react";
import { withStyles } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import { LinearProgressProps } from "@material-ui/core/LinearProgress/LinearProgress";
import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles({
  percentContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    transform: "translate(0%, 0px)",
  },
});

const StyledProgressAttr = withStyles((theme) => ({
  root: {
    height: theme.spacing(3),
    borderRadius: 0,
  },
  colorPrimary: {
    backgroundColor:
      theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
  },
  bar: {
    borderRadius: 0,
    backgroundColor: theme.palette.success.light,
  },
}))(LinearProgress);

type ProgressAttrProps = LinearProgressProps;

export default function ProgressAttr(props: ProgressAttrProps): JSX.Element {
  const {
    variant = "indeterminate",
    className,
    style,
    value,
    ...other
  } = props;
  const classes = useStyles();

  // Display indeterminate progress
  if (variant === "indeterminate") {
    return <StyledProgressAttr {...props} />;
  }

  // Display determinate progress with percents.
  return (
    <div className={clsx(classes.container, className)} style={style}>
      <StyledProgressAttr variant={variant} value={value} {...other} />
      <div className={classes.percentContainer}>
        <div>{`${value?.toFixed(2)}%`}</div>
      </div>
    </div>
  );
}
