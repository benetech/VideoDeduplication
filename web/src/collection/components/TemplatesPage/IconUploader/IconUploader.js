import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  dropDown: {
    border: "4px dashed #D8D8D8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

function Index(props) {
  const { className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.dropDown, className)}></div>;
}

Index.propTypes = {
  className: PropTypes.string,
};

export default Index;
