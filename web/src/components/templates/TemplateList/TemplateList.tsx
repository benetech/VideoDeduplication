import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import TemplateListItem from "./TemplateListItem";

const useStyles = makeStyles<Theme>({
  list: {},
});

function TemplateList(props: TemplateListProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.list, className)} {...other}>
      {children}
    </div>
  );
} // List item accessor

TemplateList.Item = TemplateListItem;
type TemplateListProps = {
  /**
   * Template list items.
   */
  children?: React.ReactNode;
  className?: string;
};
export default TemplateList;
