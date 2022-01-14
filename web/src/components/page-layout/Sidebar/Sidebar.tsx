import React, { HTMLAttributes } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  sidebar: {
    marginLeft: theme.spacing(4),
    maxWidth: 380,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

type SidebarProps = HTMLAttributes<HTMLDivElement> & {
  show?: boolean;
  children?: React.ReactNode;
  className?: string;
};

function Sidebar(props: SidebarProps): JSX.Element | null {
  const { show = true, children, className, ...other } = props;
  const classes = useStyles();

  if (!show) {
    return null;
  }

  return (
    <div className={clsx(classes.sidebar, className)} {...other}>
      {children}
    </div>
  );
}

export default Sidebar;
