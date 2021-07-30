import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CollapseButton from "../CollapseButton";
import Collapse from "@material-ui/core/Collapse";

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    flexGrow: 1,
  },
  collapseButton: {
    flexGrow: 0,
  },
  content: {
    padding: theme.spacing(2),
  },
}));

function LabeledSection(props) {
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

LabeledSection.propTypes = {
  /**
   * Section title.
   */
  title: PropTypes.string.isRequired,
  /**
   * Make section collapsible.
   */
  collapsible: PropTypes.bool,
  /**
   * Section contents.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default LabeledSection;
