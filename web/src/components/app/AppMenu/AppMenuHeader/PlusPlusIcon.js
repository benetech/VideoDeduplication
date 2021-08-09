import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import PlusIcon from "./PlusIcon";

const useStyles = makeStyles(() => ({
  pair: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  plus: {
    width: "43.33%",
  },
}));

function PlusPlusIcon(props) {
  const { className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.pair, className)}>
      <PlusIcon className={classes.plus} />
      <PlusIcon className={classes.plus} />
    </div>
  );
}

PlusPlusIcon.propTypes = {
  className: PropTypes.string,
};

export default PlusPlusIcon;
