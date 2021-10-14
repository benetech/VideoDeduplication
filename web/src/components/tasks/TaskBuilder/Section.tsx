import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Collapse, Theme } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";

/**
 * Properties passed to style generator.
 */
type SectionStyleProps = {
  collapse: boolean;
};

const useStyles = makeStyles<Theme, SectionStyleProps>((theme) => ({
  separator: {
    display: "flex",
    alignItems: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  title: { ...theme.mixins.title2, fontWeight: "bold" },
  divider: {
    flexGrow: 1,
    height: 0,
    marginLeft: theme.spacing(4),
    marginRight: ({ collapse }) => theme.spacing(collapse ? 1.5 : 4),
    borderTop: `2px solid ${theme.palette.dividerLight}`,
  },
  actions: {
    display: "flex",
    alignItems: "center",
  },
}));
/**
 * Common layout for task form section
 */

function Section(props: SectionProps): JSX.Element {
  const { title, collapse = false, children, className, ...other } = props;
  const [expand, setExpand] = useState(true);
  const classes = useStyles({
    collapse,
  });
  const toggleExpand = useCallback(() => setExpand(!expand), [expand]);
  const Icon = expand ? ExpandMoreOutlinedIcon : ChevronRightOutlinedIcon;
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.separator}>
        <div className={classes.title}>{title}</div>
        <div className={classes.divider} />
        {collapse && (
          <IconButton onClick={toggleExpand}>
            <Icon />
          </IconButton>
        )}
      </div>
      <Collapse in={expand}>
        <div>{children}</div>
      </Collapse>
    </div>
  );
}

type SectionProps = {
  /**
   * Task param title.
   */
  title: string;

  /**
   * Enable collapsing.
   */
  collapse?: boolean;

  /**
   * Section contents.
   */
  children?: React.ReactNode;
  className?: string;
};
export default Section;
