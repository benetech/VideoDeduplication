import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import AppMenu from "../AppMenu";
import clsx from "clsx";
import Label from "../../../common/components/Label";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    height: "100vh",
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
  },
  content: {
    display: "flex",
    flexGrow: 2,
    maxWidth: theme.dimensions.application.maxWidth,
  },
  menu: {
    minHeight: "100vh",
  },
  body: {
    flexGrow: 2,
    paddingTop: 20,
    paddingLeft: 15,
  },
}));

/**
 * Top-level application layout: side-bar menu + body.
 */
function ApplicationLayout(props) {
  const { className } = props;
  const classes = useStyles();

  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.content}>
        <AppMenu className={classes.menu} />
        <div className={classes.body}>
          <Label variant="title2">My Collection</Label>
        </div>
      </div>
    </div>
  );
}

ApplicationLayout.propTypes = {
  className: PropTypes.string,
};

export default ApplicationLayout;
