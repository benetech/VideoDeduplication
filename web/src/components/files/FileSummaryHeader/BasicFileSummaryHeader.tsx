import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { VideoFile } from "../../../model/VideoFile";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import { IntlShape, useIntl } from "react-intl";
import FileSummary from "../FileSummary";

const useStyles = makeStyles<Theme>((theme) => ({
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

function getMessages(intl: IntlShape) {
  return {
    goBack: intl.formatMessage({
      id: "actions.goBack",
    }),
  };
}

function BasicFileSummaryHeader(
  props: BasicFileSummaryHeaderProps
): JSX.Element {
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

type BasicFileSummaryHeaderProps = {
  /**
   * Video file to be displayed
   */
  file: VideoFile;

  /**
   * Handle go-back action.
   */
  onBack?: (...args: any[]) => void;

  /**
   * Summary attributes.
   */
  children?: React.ReactNode;
  className?: string;
};
export default BasicFileSummaryHeader;
