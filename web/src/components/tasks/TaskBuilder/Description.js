import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  description: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    ...theme.mixins.text,
    color: "#505050",
  },
  descriptionTitle: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
}));

function Description(props) {
  const { text, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(className)} {...other}>
      <div className={classes.descriptionTitle}>Description</div>
      <div className={classes.description}>{text}</div>
    </div>
  );
}

Description.propTypes = {
  /**
   * Description text.
   */
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Description;
