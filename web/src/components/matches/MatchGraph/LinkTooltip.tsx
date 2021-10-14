import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Distance from "../Distance";
import Paper from "@material-ui/core/Paper";
import FileTooltip from "./tooltip/FileTooltip";
import { ClusterLink } from "./model";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    padding: theme.spacing(1),
  },
  file: {
    paddingBottom: theme.spacing(1),
  },
  distance: {
    minWidth: 200,
  },
}));

function LinkTooltip(props: LinkTooltipProps): JSX.Element | null {
  const { link, className, ...other } = props;
  const classes = useStyles();
  if (
    link == null ||
    typeof link.source === "number" ||
    typeof link.target === "number"
  ) {
    return null;
  }

  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      <FileTooltip file={link.source.file} className={classes.file} />
      <FileTooltip file={link.target.file} className={classes.file} />
      <Distance value={link.distance} dense className={classes.distance} />
    </Paper>
  );
}

type LinkTooltipProps = {
  /**
   * Link being summarized.
   */
  link?: ClusterLink;
  className?: string;
  style?: React.CSSProperties;
};
export default LinkTooltip;
