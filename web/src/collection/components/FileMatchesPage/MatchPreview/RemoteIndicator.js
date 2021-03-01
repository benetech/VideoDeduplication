import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    textAlign: "center",
    ...theme.mixins.captionText,
    maxWidth: 125,
  },
  icon: {
    margin: theme.spacing(0.5),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    warning: intl.formatMessage({ id: "file.remote.warning" }),
  };
}

function RemoteIndicator(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  return (
    <div className={clsx(classes.container, className)} {...other}>
      <div className={classes.content}>
        <div>{messages.warning}</div>
      </div>
    </div>
  );
}

RemoteIndicator.propTypes = {
  className: PropTypes.string,
};

export default RemoteIndicator;
