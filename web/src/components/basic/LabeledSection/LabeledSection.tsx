import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import CollapseButton from "../CollapseButton";
import Collapse from "@material-ui/core/Collapse";

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  title: { ...theme.mixins.title3, fontWeight: "bold", flexGrow: 1 },
  collapseButton: {
    flexGrow: 0,
  },
  content: {
    padding: theme.spacing(2),
  },
}));

function LabeledSection(props: LabeledSectionProps): JSX.Element {
  const { title, collapsible = false, children, className, ...other } = props;
  const [collapsed, setCollapsed] = useState(false);
  const classes = useStyles();
  const handleCollapse = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed]
  );
  return (
    <div className={clsx(className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{title}</div>
        {collapsible && (
          <CollapseButton
            collapsed={collapsed}
            onClick={handleCollapse}
            size="small"
          />
        )}
      </div>
      <Collapse in={!collapsed}>
        <div className={classes.content}>{children}</div>
      </Collapse>
    </div>
  );
}

type LabeledSectionProps = {
  /**
   * Section title.
   */
  title: string;

  /**
   * Make section collapsible.
   */
  collapsible?: boolean;

  /**
   * Section contents.
   */
  children?: React.ReactNode;
  className?: string;
};
export default LabeledSection;
