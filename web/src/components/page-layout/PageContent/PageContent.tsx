import React, { HTMLAttributes } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>({
  pageContent: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
});

type PageContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

function PageContent(props: PageContentProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.pageContent, className)} {...other}>
      {children}
    </div>
  );
}

export default PageContent;
