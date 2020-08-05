import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import PageHeader from "./PageHeader";

const useStyles = makeStyles(() => ({
  pageRoot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    height: "min-content",
  },
  pageHeader: {
    flexShrink: 0,
  },
  pageBody: {
    flexGrow: 1,
    width: "100%",
  },
}));

/**
 * Common layout for application page body.
 */
function AppPage(props) {
  const { title, header = null, children, className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.pageRoot, className)}>
      <PageHeader title={title} className={classes.pageHeader}>
        {header}
      </PageHeader>
      <div className={classes.pageBody}>{children}</div>
    </div>
  );
}

AppPage.propTypes = {
  /**
   * Page title displayed in the header.
   */
  title: PropTypes.string,
  /**
   * Custom header content.
   */
  header: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  /**
   * Page body content.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default AppPage;
