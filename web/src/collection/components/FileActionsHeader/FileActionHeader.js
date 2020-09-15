import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileNavigationTabs from "../FileNavigationTabs";

const useStyles = makeStyles((theme) => ({
  actionsHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  navTabs: {
    flexShrink: 2,
    width: 400,
  },
  actions: {
    flexGrow: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: theme.spacing(4),
  },
}));

function FileActionHeader(props) {
  const { id, matches, children: actions, className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.actionsHeader, className)}>
      <FileNavigationTabs
        id={id}
        matches={matches}
        className={classes.navTabs}
      />
      <div className={classes.actions}>{actions}</div>
    </div>
  );
}

FileActionHeader.propTypes = {
  /**
   * Currently displayed file id.
   */
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /**
   * Number of file matches.
   */
  matches: PropTypes.number,
  /**
   * Action elements
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default FileActionHeader;
