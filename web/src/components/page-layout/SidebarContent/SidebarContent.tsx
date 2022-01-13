import React, { HTMLAttributes } from "react";
import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  sticky: {
    position: "sticky",
    top: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(6)}px)`,
  },
}));

type SidebarContentProps = HTMLAttributes<HTMLDivElement> & {
  sticky?: boolean;
  children?: React.ReactNode;
  className?: string;
};

function SidebarContent(props: SidebarContentProps): JSX.Element {
  const { children, className, sticky, ...other } = props;
  const classes = useStyles();

  return (
    <div className={clsx(className, sticky && classes.sticky)} {...other}>
      {children}
    </div>
  );
}

export default SidebarContent;
