import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import ProcessingDescription from "./ProcessingDescription";
import { IconButton } from "@material-ui/core";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  title: {
    ...theme.mixins.title0,
    marginRight: theme.spacing(5),
  },
  description: {
    flexGrow: 1,
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "processing.title" }),
  };
}

function ProcessingHeader(props) {
  const { onClose, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  return (
    <div className={clsx(classes.header, className)} {...other}>
      <div className={classes.title}>{messages.title}</div>
      <ProcessingDescription className={classes.description} />
      <IconButton color="inherit" onClick={onClose}>
        <CloseOutlinedIcon color="inherit" fontSize="large" />
      </IconButton>
    </div>
  );
}

ProcessingHeader.propTypes = {
  /**
   * Handle close action.
   */
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default ProcessingHeader;
