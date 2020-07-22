import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import PlusPlusIcon from "./PlusPlusIcon";
import Label from "../../../../common/components/Label";

const useStyles = makeStyles(() => ({
  logo: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    width: 46,
    marginRight: 9,
  },
}));

function ExpandedLogo(props) {
  const { className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.logo, className)}>
      <PlusPlusIcon className={classes.icon} />
      <Label role="title2" color="primary">
        winnow
      </Label>
    </div>
  );
}

ExpandedLogo.propTypes = {
  className: PropTypes.string,
};

export default ExpandedLogo;
