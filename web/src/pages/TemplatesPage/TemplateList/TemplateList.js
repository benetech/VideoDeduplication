import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TemplateListItem from "./TemplateListItem";

const useStyles = makeStyles({
  list: {},
});

function TemplateList(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.list, className)} {...other}>
      {children}
    </div>
  );
}

// List item accessor
TemplateList.Item = TemplateListItem;

TemplateList.propTypes = {
  /**
   * Template list items.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default TemplateList;
