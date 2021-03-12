import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  item: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(1),
    borderColor: theme.palette.border.light,
    borderStyle: "solid",
  },
}));

function TemplateListItem(props) {
  const { className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.item, className)}>hello</div>;
}

TemplateListItem.propTypes = {
  className: PropTypes.string,
};

export default TemplateListItem;
