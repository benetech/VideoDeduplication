import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import { Avatar } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles({
  icon: {
    width: 40,
    height: 40,
  },
});

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    altIcon: intl.formatMessage({ id: "templates.icon" }),
  };
}

/**
 * Custom (uploaded by user) template icon.
 */
function CustomIcon(props) {
  const { url, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  return (
    <Avatar
      src={url}
      variant="square"
      className={clsx(classes.icon, className)}
      alt={messages.altIcon}
      {...other}
    />
  );
}

CustomIcon.propTypes = {
  /**
   * Icon url.
   */
  url: PropTypes.string,
  className: PropTypes.string,
};

export default CustomIcon;
