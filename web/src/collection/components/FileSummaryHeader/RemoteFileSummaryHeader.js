import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import { FileType } from "../../prop-types/FileType";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import FileSummary from "../FileSummary";
import useTheme from "@material-ui/styles/useTheme";
import { useMediaQuery } from "@material-ui/core";
import { routes } from "../../../routing/routes";

const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  summary: {
    flexGrow: 1,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    minWidth: 0,
  },
}));

/**
 * Get translated text.
 */
function getMessages(intl) {
  return {
    goBack: intl.formatMessage({ id: "actions.goBack" }),
  };
}

/**
 * Check if the screen is small.
 */
function useSmallScreen() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("md"));
}

function RemoteFileSummaryHeader(props) {
  const { file, className } = props;
  const classes = useStyles();
  const history = useHistory();
  const intl = useIntl();
  const small = useSmallScreen();
  const messages = getMessages(intl);

  const handleBack = useCallback(
    () => history.push(routes.collection.fingerprints, { keepFilters: true }),
    [history]
  );

  return (
    <Paper
      className={clsx(classes.header, className)}
      data-selector="FileSummaryHeader"
    >
      <IconButton onClick={handleBack} aria-label={messages.goBack}>
        <ArrowBackOutlinedIcon />
      </IconButton>
      <FileSummary file={file} divider className={classes.summary}>
        <FileSummary.RemoteHash />
        <FileSummary.RemoteRepo />
        <FileSummary.RemoteOwner />
      </FileSummary>
    </Paper>
  );
}

RemoteFileSummaryHeader.propTypes = {
  /**
   * Video file to be played
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default RemoteFileSummaryHeader;
