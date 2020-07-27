import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
  dashletRoot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
    height: "100%",
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
  },
  summary: {
    ...theme.mixins.title2,
    fontWeight: "bold",
    paddingLeft: theme.spacing(2),
  },
  actions: {},
  spacer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contentArea: {
    flexGrow: 1,
    padding: theme.spacing(4),
  },
}));

function Dashlet(props) {
  const { title, summary, actions, children, className } = props;
  const classes = useStyles();

  const titleElement =
    title != null ? <div className={classes.title}>{title}</div> : null;

  const summaryElement =
    summary != null ? <div className={classes.summary}>{summary}</div> : null;

  const actionsElement =
    actions != null ? <div className={classes.actions}>{actions}</div> : null;

  const hasHeader = title != null || summary != null || actions != null;

  const header = hasHeader ? (
    <div className={classes.header}>
      {titleElement}
      {summaryElement}
      <div className={classes.spacer} />
      {actionsElement}
    </div>
  ) : null;

  return (
    <Paper className={clsx(className)}>
      <div className={classes.content}>
        {header}
        <div className={classes.contentArea}>{children}</div>
      </div>
    </Paper>
  );
}

Dashlet.propTypes = {
  title: PropTypes.string,
  summary: PropTypes.any,
  actions: PropTypes.node,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default Dashlet;
