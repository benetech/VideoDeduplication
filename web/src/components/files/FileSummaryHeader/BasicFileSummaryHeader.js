import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import { FileType } from "../../../prop-types/FileType";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import { useIntl } from "react-intl";
import FileSummary from "../FileSummary";

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

function BasicFileSummaryHeader(props) {
  const { file, onBack, children, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  const messages = getMessages(intl);

  return (
    <Paper
      className={clsx(classes.header, className)}
      data-selector="FileSummaryHeader"
      {...other}
    >
      {onBack && (
        <IconButton onClick={onBack} aria-label={messages.goBack}>
          <ArrowBackOutlinedIcon />
        </IconButton>
      )}
      <FileSummary file={file} divider className={classes.summary}>
        {children}
      </FileSummary>
    </Paper>
  );
}

BasicFileSummaryHeader.propTypes = {
  /**
   * Video file to be displayed
   */
  file: FileType.isRequired,
  /**
   * Handle go-back action.
   */
  onBack: PropTypes.func,
  /**
   * Summary attributes.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default BasicFileSummaryHeader;
