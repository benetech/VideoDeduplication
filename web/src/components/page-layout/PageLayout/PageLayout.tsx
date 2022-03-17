import React, { HTMLAttributes } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  pageLayout: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
    display: "flex",
    alignItems: "stretch",
  },
}));

type PageLayoutProps = HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

function PageLayout(props: PageLayoutProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.pageLayout, className)} {...other}>
      {children}
    </div>
  );
}

export default PageLayout;
