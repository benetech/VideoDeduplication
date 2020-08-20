import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  marked: {
    backgroundColor: theme.palette.warning.light,
  },
}));

/**
 * Find the first entry of marked substring in the text and split the text by
 * that entry.
 *
 * @returns {string[]|*[]}
 */
function split(text, marked) {
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
function Marked(props) {
  const { children: text, mark, className } = props;
  const classes = useStyles();

  const [before, marked, after] = split(text, mark);

  return (
    <span className={className}>
      {before}
      <span className={classes.marked}>{marked}</span>
      {after}
    </span>
  );
}

Marked.propTypes = {
  mark: PropTypes.string,
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Marked;
