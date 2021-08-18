import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import * as GameIcon from "react-icons/gi";
import CancelPresentationOutlinedIcon from "@material-ui/icons/CancelPresentationOutlined";
import clsx from "clsx";

const useStyles = makeStyles({
  defaultIcon: {
    width: 40,
    height: 40,
    fontSize: 40,
  },
});

function StandardIcon(props) {
  const { name, className, ...other } = props;
  const classes = useStyles();
  const iconDiv = GameIcon[name] ? (
    React.createElement(GameIcon[name])
  ) : (
    <CancelPresentationOutlinedIcon />
  );
  return (
    <div className={clsx(classes.defaultIcon, className)} {...other}>
      {iconDiv}
    </div>
  );
}

StandardIcon.propTypes = {
  /**
   * Icon name.
   */
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default StandardIcon;
