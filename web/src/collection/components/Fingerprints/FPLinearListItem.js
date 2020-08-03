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
    padding: theme.spacing(3),
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
}));

function ExifIcon(props) {
  const { className } = props;
  return <div className={className}>[EXIF]</div>;
}

ExifIcon.propTypes = {
  className: PropTypes.string,
};

function FpLinearListItem(props) {
  const { button = false, className } = props;
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
      <div className={classes.iconContainer}>
        <VideocamOutlinedIcon className={classes.icon} />
      </div>
      <AttributeText
        name="File name"
        value="PolicemanDetroit01.mp4"
        variant="title"
        className={classes.fileName}
      />
      <AttributeText
        name="Fingerprint"
        value="#4242K"
        variant="primary"
        className={classes.attr}
      />
      <div className={classes.divider} />
      <AttributeText
        value="7:40 minutes"
        icon={ScheduleOutlinedIcon}
        variant="normal"
        className={classes.attr}
      />
      <div className={classes.divider} />
      <AttributeText
        value="07/30/2020"
        icon={EventAvailableOutlinedIcon}
        variant="normal"
        className={classes.attr}
      />
      <div className={classes.divider} />
      <AttributeText
        value="YES"
        icon={ExifIcon}
        variant="primary"
        className={classes.attr}
      />
      <div className={classes.divider} />
      <VolumeOffOutlinedIcon className={clsx(classes.attr, classes.volume)} />
      <div className={classes.divider} />
      <IconButton>
        <MoreHorizOutlinedIcon />
      </IconButton>
    </div>
  );
}

FpLinearListItem.propTypes = {
  file: FingerprintType,
  button: PropTypes.bool,
  className: PropTypes.string,
};

export default FpLinearListItem;
