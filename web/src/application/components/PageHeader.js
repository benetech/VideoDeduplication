import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppActions from "./AppActions";
import Label from "../../common/components/Label";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.dimensions.header.padding,
    zIndex: 1,
    backgroundColor: theme.palette.background.default,
  },
  title: {
    flexShrink: 0,
  },
  content: {
    width: "100%",
  },
  actions: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
}));

function titleElement(title, classes) {
  if (title != null) {
    return (
      <Label className={classes.title} variant="title2">
        {title}
      </Label>
    );
  }
  return null;
}

/**
 * Navigation elements displayed at the page header.
 */
function PageHeader(props) {
  const { title, children, className } = props;
  const classes = useStyles();

  return (
    <div data-selector="PageHeader" className={clsx(classes.header, className)}>
      {titleElement(title, classes)}
      <div className={classes.content}>{children}</div>
      <AppActions className={classes.actions} />
    </div>
  );
}

PageHeader.propTypes = {
  /**
   * Optional page title.
   */
  title: PropTypes.string,
  /**
   * Custom elements displayed on the application header.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default PageHeader;
