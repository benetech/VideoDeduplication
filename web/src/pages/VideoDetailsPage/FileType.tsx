import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ValueBadge from "../../components/basic/ValueBadge";

const useStyles = makeStyles<Theme>({
  type: {
    backgroundColor: "#E691A1",
  },
});

function FileType(props: FileTypeProps): JSX.Element | null {
  const { type, className } = props;
  const classes = useStyles();

  if (type == null) {
    return null;
  }

  return <ValueBadge className={clsx(classes.type, className)} value={type} />;
}

type FileTypeProps = {
  /**
   * File format
   */
  type?: string;
  className?: string;
};
export default FileType;
