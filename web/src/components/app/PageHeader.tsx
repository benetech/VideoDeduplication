import React from "react";
import clsx from "clsx";
import { ClassNameMap, makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import AppActions from "./AppActions";
import Label from "../basic/Label";

const useStyles = makeStyles<Theme>((theme) => ({
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

function titleElement(title: string, classes: ClassNameMap) {
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
function PageHeader(props: PageHeaderProps): JSX.Element {
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

type PageHeaderProps = {
  /**
   * Optional page title.
   */
  title: string;

  /**
   * Custom elements displayed on the application header.
   */
  children?: React.ReactNode;
  className?: string;
};
export default PageHeader;
