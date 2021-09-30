import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FileNavigationTabs from "../FileNavigationTabs";

const useStyles = makeStyles<Theme>((theme) => ({
  actionsHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  navTabs: {
    flexShrink: 2,
  },
  actions: {
    flexGrow: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: theme.spacing(4),
  },
}));

function FileActionHeader(props: FileActionHeaderProps): JSX.Element {
  const {
    id,
    matches,
    remote = false,
    children: actions,
    className,
    ...other
  } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.actionsHeader, className)} {...other}>
      <FileNavigationTabs
        id={id}
        matches={matches}
        remote={remote}
        className={classes.navTabs}
      />
      <div className={classes.actions}>{actions}</div>
    </div>
  );
}

type FileActionHeaderProps = {
  /**
   * Currently displayed file id.
   */
  id: string | number;

  /**
   * Number of file matches.
   */
  matches?: number;

  /**
   * Flag indicating that the file is remote.
   */
  remote?: boolean;

  /**
   * Action elements
   */
  children?: React.ReactNode;
  className?: string;
};
export default FileActionHeader;
