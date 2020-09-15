import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../FileType";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import EventAvailableOutlinedIcon from "@material-ui/icons/EventAvailableOutlined";
import VolumeOffOutlinedIcon from "@material-ui/icons/VolumeOffOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import AttributeText from "../../../../common/components/AttributeText";
import IconButton from "@material-ui/core/IconButton";
import {
  formatBool,
  formatDate,
  formatDuration,
} from "../../../../common/helpers/format";
import { useIntl } from "react-intl";
import ExifIcon from "../../../../common/components/icons/ExifIcon";

const useStyles = makeStyles((theme) => ({
  decor: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: theme.palette.border.light,
  },
  layout: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(3),
  },
  buttonStyle: {
    cursor: "pointer",
    "&:hover": {
      borderColor: theme.palette.primary.light,
    },
  },
  icon: {
    color: theme.palette.primary.contrastText,
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(4),
    height: theme.spacing(4),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: {
    flexGrow: 1,
    minWidth: 0,
    marginLeft: theme.spacing(3),
  },
  volume: {
    color: theme.palette.action.textInactive,
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
  md: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  sm: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

function useMessages(intl) {
  return {
    attr: {
      filename: intl.formatMessage({ id: "file.attr.name" }),
      fingerprint: intl.formatMessage({ id: "file.attr.fingerprint" }),
      quality: intl.formatMessage({ id: "file.attr.quality" }),
    },
  };
}

const FileLinearListItem = React.memo(function FpLinearListItem(props) {
  const { file, button = false, highlight, onClick, className } = props;
  const intl = useIntl();
  const messages = useMessages(intl);

  const handleClick = useCallback(() => onClick(file), [file, onClick]);

  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.decor,
        classes.layout,
        button && classes.buttonStyle,
        className
      )}
      onClick={handleClick}
      aria-label={intl.formatMessage({ id: "actions.showFileDetails" })}
    >
      <div className={classes.iconContainer}>
        <VideocamOutlinedIcon className={classes.icon} />
      </div>
      <AttributeText
        name={messages.attr.filename}
        value={file.filename}
        variant="title"
        highlighted={highlight}
        ellipsis
        className={classes.fileName}
      />
      <AttributeText
        name={messages.attr.fingerprint}
        value={file.fingerprint && file.fingerprint.slice(0, 7)}
        variant="primary"
        className={clsx(classes.attr, classes.sm)}
      />
      <div className={clsx(classes.divider, classes.sm)} />
      <AttributeText
        value={formatDuration(file.metadata.length, intl)}
        icon={ScheduleOutlinedIcon}
        variant="normal"
        className={classes.attr}
      />
      <div className={classes.divider} />
      <AttributeText
        value={formatDate(file.metadata.uploadDate, intl)}
        icon={EventAvailableOutlinedIcon}
        variant="normal"
        defaultValue="Unknown"
        className={clsx(classes.attr, classes.md)}
      />
      <div className={clsx(classes.divider, classes.md)} />
      <AttributeText
        value={formatBool(file.metadata.hasEXIF, intl)}
        icon={ExifIcon}
        variant="primary"
        className={clsx(classes.attr, classes.md)}
      />
      <div className={clsx(classes.divider, classes.md)} />
      <VolumeOffOutlinedIcon
        className={clsx(classes.attr, classes.volume, classes.md)}
      />
      <div className={clsx(classes.divider, classes.md)} />
      <IconButton
        aria-label={intl.formatMessage({ id: "actions.showMoreOptions" })}
      >
        <MoreHorizOutlinedIcon />
      </IconButton>
    </div>
  );
});

FileLinearListItem.propTypes = {
  file: FileType.isRequired,
  highlight: PropTypes.string,
  button: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default FileLinearListItem;
