import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  separator: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  title: { ...theme.mixins.title3, fontWeight: 500 },
  divider: {
    flexGrow: 1,
    height: 0,
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(1.5),
    borderTop: `2px solid ${theme.palette.dividerLight}`,
  },
  actions: {
    display: "flex",
    alignItems: "center",
  },
}));

function SectionSeparator(props: SectionSeparatorProps): JSX.Element {
  const { title, children: actions, className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.separator, className)}>
      <div className={classes.title}>{title}</div>
      <div className={classes.divider} />
      <div className={classes.actions}>{actions}</div>
    </div>
  );
}

type SectionSeparatorProps = {
  /**
   * Section title
   */
  title: string;

  /**
   * Section actions elements
   */
  children?: React.ReactNode;
  className?: string;
};
export default SectionSeparator;
