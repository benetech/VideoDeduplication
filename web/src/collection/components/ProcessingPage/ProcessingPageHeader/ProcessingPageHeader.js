import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import Description from "./Description";
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
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      flexGrow: 1,
    },
  },
  description: {
    flexGrow: 1,
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
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

function ProcessingPageHeader(props) {
  const { onClose, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  return (
    <div className={clsx(classes.header, className)} {...other}>
      <div className={classes.title}>{messages.title}</div>
      <Description className={classes.description} />
      <IconButton color="inherit" onClick={onClose}>
        <CloseOutlinedIcon color="inherit" fontSize="large" />
      </IconButton>
    </div>
  );
}

ProcessingPageHeader.propTypes = {
  /**
   * Handle close action.
   */
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default ProcessingPageHeader;
