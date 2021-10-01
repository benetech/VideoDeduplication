import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  marked: {
    backgroundColor: theme.palette.warning.light,
  },
}));
/**
 * Find the first entry of marked substring in the text and split the text by
 * that entry.
 */

function split(
  text: string,
  marked: string | undefined
): [string, string | null, string | null] {
  if (marked == null || marked.length === 0) {
    return [text, null, null];
  }

  const start = text.toLowerCase().indexOf(marked.toLowerCase());
  const end = start + marked.length;

  if (start < 0) {
    return [text, null, null];
  }

  return [
    text.substring(0, start),
    text.substring(start, end),
    text.substring(end),
  ];
}
/**
 * Text with marked substring
 */

function Marked(props: MarkedProps): JSX.Element {
  const { children: text, mark, className } = props;
  const classes = useStyles();
  const [before, marked, after] = split(text, mark);
  return (
    <div className={className}>
      {before}
      <span className={classes.marked}>{marked}</span>
      {after}
    </div>
  );
}

type MarkedProps = {
  mark?: string;
  children: string;
  className?: string;
};
export default Marked;
