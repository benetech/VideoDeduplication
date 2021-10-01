import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import PageHeader from "./PageHeader";

const useStyles = makeStyles<Theme>(() => ({
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

function AppPage(props: AppPageProps): JSX.Element {
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

type AppPageProps = {
  /**
   * Page title displayed in the header.
   */
  title: string;

  /**
   * Custom header content.
   */
  header?: React.ReactNode;

  /**
   * Page body content.
   */
  children?: React.ReactNode;
  className?: string;
};
export default AppPage;
