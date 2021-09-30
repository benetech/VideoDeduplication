import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FileType from "../../../pages/VideoDetailsPage/FileType";

const useStyles = makeStyles<Theme>((theme) => ({
  list: {
    display: "flex",
    maxWidth: 300,
  },
  extension: {
    marginRight: theme.spacing(1),
  },
}));

function ExtensionList(props: ExtensionListProps): JSX.Element | null {
  const { extensions, className, ...other } = props;
  const classes = useStyles();

  if (extensions == null) {
    return null;
  }

  return (
    <div className={clsx(classes.list, className)} {...other}>
      {extensions.map((extension) => (
        <FileType
          className={classes.extension}
          type={extension}
          key={extension}
        />
      ))}
    </div>
  );
}

type ExtensionListProps = {
  /**
   * File extensions to be displayed.
   */
  extensions?: string[];
  className?: string;
};
export default ExtensionList;
