import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import PlusPlusIcon from "./PlusPlusIcon";
import Label from "../../../../common/components/Label";

const useStyles = makeStyles(() => ({
  logo: {
    display: "flex",
    flexDirection: "column",
  },
  icon: {
    width: 30,
  },
  title: {
    marginTop: -6,
  },
}));

function CollapsedLogo(props) {
  const { className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.logo, className)}>
      <PlusPlusIcon className={classes.icon} />
      <Label variant="title2" color="primary" className={classes.title}>
        JAI
      </Label>
    </div>
  );
}

CollapsedLogo.propTypes = {
  className: PropTypes.string,
};

export default CollapsedLogo;
