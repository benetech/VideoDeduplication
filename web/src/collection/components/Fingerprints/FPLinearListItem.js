import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FingerprintType } from "./type";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import EventAvailableOutlinedIcon from "@material-ui/icons/EventAvailableOutlined";
import VolumeOffOutlinedIcon from "@material-ui/icons/VolumeOffOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import AttributeText from "../../../common/components/AttributeText";
import IconButton from "@material-ui/core/IconButton";
import {
  formatBool,
  formatDate,
  formatDuration,
} from "../../../common/helpers/format";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  decor: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
      borderColor: theme.palette.primary.light,
    },
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: theme.palette.border.light,
  },
  layout: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  nameGroup: {
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    flexShrink: 2,
    minWidth: 0,
    padding: theme.spacing(1),
    paddingRight: theme.spacing(3),
  },
  attrGroup: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  buttonStyle: {
    cursor: "pointer",
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
    flexShrink: 2,
    minWidth: 0,
    marginLeft: theme.spacing(3),
    maxWidth: 340,
  },
  volume: {
    color: theme.palette.action.textInactive,
  },
  leftmostAttr: {
    marginRight: theme.spacing(3),
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
  largeDisplay: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  moreButton: {
    marginLeft: theme.spacing(2),
  },
}));

function ExifIcon(props) {
  const { className } = props;
  return <div className={className}>[EXIF]</div>;
}

ExifIcon.propTypes = {
  className: PropTypes.string,
};

function useMessages(intl) {
  return {
    attr: {
      filename: intl.formatMessage({ id: "file.attr.name" }),
      fingerprint: intl.formatMessage({ id: "file.attr.fingerprint" }),
      quality: intl.formatMessage({ id: "file.attr.quality" }),
    },
  };
}

function FpLinearListItem(props) {
  const { file, button = false, className } = props;
  const intl = useIntl();
  const messages = useMessages(intl);

  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.decor,
        classes.layout,
        button && classes.buttonStyle,
        className
      )}
    >
      <div className={classes.nameGroup}>
        <div className={classes.iconContainer}>
          <VideocamOutlinedIcon className={classes.icon} />
        </div>
        <AttributeText
          name={messages.attr.filename}
          value={file.filename}
          variant="title"
          overflow="ellipsis-start"
          className={classes.fileName}
        />
      </div>
      <div className={classes.attrGroup}>
        <AttributeText
          name={messages.attr.fingerprint}
          value={file.fingerprint}
          variant="primary"
          className={clsx(classes.leftmostAttr, classes.largeDisplay)}
        />
        <div className={clsx(classes.divider, classes.largeDisplay)} />
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
          className={clsx(classes.attr, classes.largeDisplay)}
        />
        <div className={clsx(classes.divider, classes.largeDisplay)} />
        <AttributeText
          value={formatBool(file.metadata.hasEXIF, intl)}
          icon={ExifIcon}
          variant="primary"
          className={clsx(classes.attr, classes.largeDisplay)}
        />
        <div className={clsx(classes.divider, classes.largeDisplay)} />
        <VolumeOffOutlinedIcon
          className={clsx(classes.attr, classes.volume, classes.largeDisplay)}
        />
        <div className={clsx(classes.divider, classes.largeDisplay)} />
        <IconButton className={classes.moreButton}>
          <MoreHorizOutlinedIcon />
        </IconButton>
      </div>
    </div>
  );
}

FpLinearListItem.propTypes = {
  file: FingerprintType.isRequired,
  button: PropTypes.bool,
  className: PropTypes.string,
};

export default FpLinearListItem;
