import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>({
  groupList: {
    display: "flex",
    flexDirection: "column",
  },
});

function ObjectGroupList(props: ObjectGroupListProps): JSX.Element {
  const { children: groups, className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.groupList, className)}>{groups}</div>;
}

type ObjectGroupListProps = {
  /**
   * Object group array
   */
  children?: React.ReactNode;
  className?: string;
};
export default ObjectGroupList;
