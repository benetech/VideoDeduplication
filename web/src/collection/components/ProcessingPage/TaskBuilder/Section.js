import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Collapse } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";

const useStyles = makeStyles((theme) => ({
  separator: {
    display: "flex",
    alignItems: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  title: {
    ...theme.mixins.title2,
    fontWeight: "bold",
  },
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
function Section(props) {
  const { title, collapse = false, children, className, ...other } = props;
  const [expand, setExpand] = useState(true);
  const classes = useStyles({ collapse });

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

Section.propTypes = {
  /**
   * Task param title.
   */
  title: PropTypes.string.isRequired,
  /**
   * Enable collapsing.
   */
  collapse: PropTypes.bool,
  /**
   * Section contents.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default Section;
