import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import { FileType } from "../FileBrowserPage/FileType";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import AttributeText from "../../../common/components/AttributeText";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import {
  formatBool,
  formatDate,
  formatDuration,
} from "../../../common/helpers/format";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import EventAvailableOutlinedIcon from "@material-ui/icons/EventAvailableOutlined";
import ExifIcon from "../../../common/components/icons/ExifIcon";
import VolumeOffOutlinedIcon from "@material-ui/icons/VolumeOffOutlined";

const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  titleGroup: {
    flexGrow: 1,
    flexShrink: 1,
    display: "flex",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.spacing(0.5),
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(3),
  },
  icon: {
    color: theme.palette.primary.contrastText,
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
  },
  attrsGroup: {
    display: "flex",
    alignItems: "center",
  },
  attr: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
  divider: {
    borderLeftStyle: "solid",
    borderLeftColor: theme.palette.border.light,
    borderLeftWidth: 1,
    height: theme.spacing(4),
  },
  extra: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
}));

function getMessages(intl) {
  return {
    filename: intl.formatMessage({ id: "file.attr.name" }),
    fingerprint: intl.formatMessage({ id: "file.attr.fingerprint" }),
    quality: intl.formatMessage({ id: "file.attr.quality" }),
  };
}

function VideoDetailsHeader(props) {
  const { file, className } = props;
  const classes = useStyles();
  const history = useHistory();
  const intl = useIntl();
  const messages = getMessages(intl);

  const back = history.length > 0;
  const handleBack = useCallback(() => history.goBack(), [history]);

  return (
    <Paper className={clsx(classes.header, className)}>
      <div className={classes.titleGroup}>
        {back && (
          <IconButton onClick={handleBack}>
            <ArrowBackOutlinedIcon />
          </IconButton>
        )}
        <div className={classes.iconContainer}>
          <VideocamOutlinedIcon className={classes.icon} />
        </div>
        <AttributeText
          name={messages.filename}
          value={file.filename}
          variant="title"
          ellipsis
        />
      </div>
      <div className={classes.attrsGroup}>
        <AttributeText
          name={messages.fingerprint}
          value={file.fingerprint}
          variant="primary"
          className={classes.attr}
        />
        <div className={classes.divider} />
        <AttributeText
          value={formatDuration(file.metadata.length, null, false)}
          icon={ScheduleOutlinedIcon}
          variant="normal"
          className={classes.attr}
        />
        <div className={clsx(classes.divider, classes.extra)} />
        <AttributeText
          value={formatDate(file.metadata.uploadDate, intl)}
          icon={EventAvailableOutlinedIcon}
          variant="normal"
          defaultValue="Unknown"
          className={clsx(classes.attr, classes.extra)}
        />
        <div className={clsx(classes.divider, classes.extra)} />
        <AttributeText
          value={formatBool(file.metadata.hasEXIF, intl)}
          icon={ExifIcon}
          variant="primary"
          className={clsx(classes.attr, classes.extra)}
        />
        <div className={clsx(classes.divider, classes.extra)} />
        <VolumeOffOutlinedIcon className={clsx(classes.attr, classes.extra)} />
        <div className={clsx(classes.divider, classes.extra)} />
      </div>
    </Paper>
  );
}

VideoDetailsHeader.propTypes = {
  /**
   * Video file to be played
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default VideoDetailsHeader;
