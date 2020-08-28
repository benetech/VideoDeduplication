import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  separator: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: 500,
  },
  divider: {
    flexGrow: 1,
    height: 0,
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
    borderTop: `2px solid ${theme.palette.dividerLight}`,
  },
  actions: {
    display: "flex",
    alignItems: "center",
  },
}));

function SectionSeparator(props) {
  const { title, children: actions, className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.separator, className)}>
      <div className={classes.title}>{title}</div>
      <div className={classes.divider} />
      <div className={classes.actions}>{actions}</div>
    </div>
  );
}

SectionSeparator.propTypes = {
  /**
   * Section title
   */
  title: PropTypes.string.isRequired,
  /**
   * Section actions elements
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default SectionSeparator;
