import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppMenu from "../AppMenu";
import clsx from "clsx";
import CollectionPage from "../../../collection/components/CollectionPage";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
  },
  content: {
    minWidth: 0,
    minHeight: "min-content",
    display: "flex",
    flexGrow: 1,
    alignItems: "stretch",
    maxWidth: theme.dimensions.application.maxWidth,
  },
  menu: {
    flexShrink: 0,
    height: "100%",
    minHeight: "min-content",
  },
  body: {
    flexGrow: 2,
  },
}));

/**
 * Top-level application layout: side-bar menu + body.
 */
function ApplicationLayout(props) {
  const { className } = props;
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.content}>
        <AppMenu className={classes.menu} />
        <CollectionPage className={classes.body} />
      </div>
    </div>
  );
}

ApplicationLayout.propTypes = {
  className: PropTypes.string,
};

export default ApplicationLayout;
