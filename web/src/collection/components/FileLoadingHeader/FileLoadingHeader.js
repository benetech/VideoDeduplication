import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useIntl } from "react-intl";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import { useHistory } from "react-router";
import { ButtonBase } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    height: theme.spacing(10),
    padding: theme.spacing(2),
    minWidth: 0,
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...theme.mixins.title4,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  retryLink: {
    ...theme.mixins.title4,
    color: theme.palette.primary.main,
    cursor: "pointer",
    paddingLeft: theme.spacing(1),
  },
  progress: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    flexShrink: 1,
    winWidth: 0,
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    retry: intl.formatMessage({ id: "actions.retry" }),
    error: intl.formatMessage({ id: "file.load.error.single" }),
    goBack: intl.formatMessage({ id: "actions.goBack" }),
  };
}

function FileLoadingHeader(props) {
  const { error, onRetry, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const history = useHistory();

  const handleBack = useCallback(() => history.goBack(), [history]);

  const back = history.length > 0;

  if (!error) {
    return (
      <div className={clsx(classes.header, className)}>
        {back && (
          <IconButton onClick={handleBack} aria-label={messages.goBack}>
            <ArrowBackOutlinedIcon />
          </IconButton>
        )}
        <div className={classes.progress}>
          <CircularProgress color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(classes.header, className)}>
      {back && (
        <IconButton onClick={handleBack} aria-label={messages.goBack}>
          <ArrowBackOutlinedIcon />
        </IconButton>
      )}
      <div className={classes.errorMessage}>
        {messages.error}
        <ButtonBase
          className={classes.retryLink}
          onClick={onRetry}
          focusRipple
          disableTouchRipple
        >
          {messages.retry}
        </ButtonBase>
      </div>
    </div>
  );
}

FileLoadingHeader.propTypes = {
  /**
   * True iff file is not loading and previous
   * attempt resulted in failure.
   */
  error: PropTypes.bool.isRequired,
  /**
   * Fires on retry.
   */
  onRetry: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default FileLoadingHeader;
