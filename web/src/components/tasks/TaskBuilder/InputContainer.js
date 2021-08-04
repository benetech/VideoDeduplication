import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import InfoButton from "../../basic/InfoButton";

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(4),
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    marginRight: theme.spacing(2),
  },
}));

/**
 * Common layout for individual task attribute inputs.
 */
function InputContainer(props) {
  const { title, tooltip, children, className, ...other } = props;
  const classes = useStyles();

  let info = null;
  if (tooltip) {
    info = <InfoButton text={tooltip} />;
  }

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{title}</div>
        {info}
      </div>
      <div>{children}</div>
    </div>
  );
}

InputContainer.propTypes = {
  /**
   * Task param title.
   */
  title: PropTypes.string.isRequired,
  /**
   * Optional param tooltip
   */
  tooltip: PropTypes.string,
  /**
   * Enveloped input components.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default InputContainer;
