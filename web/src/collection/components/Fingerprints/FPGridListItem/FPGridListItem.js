import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FingerprintType } from "../type";
import Paper from "@material-ui/core/Paper";
import MediaPreview from "./MediaPreview";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import { composition } from "../FPGridList";
import AttributeText from "../../../../common/components/AttributeText";
import { useIntl } from "react-intl";
import {
  formatBool,
  formatDate,
  formatDuration,
} from "../../../../common/helpers/format";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import EventAvailableOutlinedIcon from "@material-ui/icons/EventAvailableOutlined";
import ExifIcon from "../../../../common/components/icons/ExifIcon";
import VolumeOffOutlinedIcon from "@material-ui/icons/VolumeOffOutlined";
import Marked from "../../../../common/components/Marked";

const useStyles = makeStyles((theme) => ({
  itemContainer: {},
  gridItem: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
  },
  asButton: {
    cursor: "pointer",
  },
  preview: {
    height: theme.dimensions.gridItem.imageHeight,
  },
  nameContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  name: {
    ...theme.mixins.textEllipsisStart,
    ...theme.mixins.title5,
    flexGrow: 1,
  },
  icon: {
    color: theme.palette.primary.contrastText,
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(3),
    height: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: theme.spacing(1),
  },
  attrRow: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  dividerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  divider: {
    borderLeftStyle: "solid",
    borderLeftColor: theme.palette.border.light,
    borderLeftWidth: 1,
    height: theme.spacing(4),
  },
  volume: {
    color: theme.palette.action.textInactive,
    fontSize: 20,
    flexGrow: 1,
  },
}));

function useMessages(intl) {
  return {
    attr: {
      filename: intl.formatMessage({ id: "file.attr.name" }),
      fingerprint: intl.formatMessage({ id: "file.attr.fingerprint" }),
      quality: intl.formatMessage({ id: "file.attr.quality" }),
      duration: intl.formatMessage({ id: "file.attr.duration" }),
    },
  };
}

function FpGridListItem(props) {
  const { file, button = false, dense = false, highlight, className } = props;
  const intl = useIntl();
  const messages = useMessages(intl);
  const decrease = dense ? 1 : 0;

  const classes = useStyles();
  return (
    <Grid
      item
      xs={12 / Math.max(composition.xs - decrease, 1)}
      sm={12 / Math.max(composition.sm - decrease, 1)}
      md={12 / Math.max(composition.md - decrease, 1)}
      lg={12 / Math.max(composition.lg - decrease, 1)}
      xl={12 / Math.max(composition.xl - decrease, 1)}
      className={classes.itemContainer}
    >
      <Paper
        className={clsx(
          classes.gridItem,
          button && classes.asButton,
          className
        )}
      >
        <MediaPreview
          src={file.preview}
          alt="preview"
          className={classes.preview}
        />
        <div className={classes.nameContainer}>
          <div className={classes.iconContainer}>
            <VideocamOutlinedIcon className={classes.icon} />
          </div>
          <div className={classes.name}>
            <Marked mark={highlight}>{file.filename}</Marked>
          </div>
          <IconButton size="small">
            <MoreHorizOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
        <div className={classes.attrRow}>
          <AttributeText
            name={messages.attr.fingerprint}
            value={file.fingerprint}
            variant="primary"
            size="small"
          />
          <div className={classes.dividerContainer}>
            <div className={classes.divider} />
          </div>
          <AttributeText
            name={messages.attr.quality}
            value={file.metadata.quality}
            defaultValue="Unknown"
            variant="primary"
            size="small"
          />
          <div className={classes.dividerContainer}>
            <div className={classes.divider} />
          </div>
          <AttributeText
            name={messages.attr.duration}
            value={formatDuration(file.metadata.length, intl)}
            variant="primary"
            size="small"
          />
        </div>
        <div className={classes.attrRow}>
          <AttributeText
            value={formatDate(file.metadata.uploadDate, intl)}
            icon={EventAvailableOutlinedIcon}
            variant="normal"
            defaultValue="Unknown"
            size="small"
          />
          <div className={classes.dividerContainer}>
            <div className={classes.divider} />
          </div>
          <AttributeText
            value={formatBool(file.metadata.hasEXIF, intl)}
            icon={ExifIcon}
            variant="primary"
            size="small"
          />
          <div className={classes.dividerContainer}>
            <div className={classes.divider} />
          </div>
          <VolumeOffOutlinedIcon className={classes.volume} />
        </div>
      </Paper>
    </Grid>
  );
}

FpGridListItem.propTypes = {
  file: FingerprintType.isRequired,
  button: PropTypes.bool,
  dense: PropTypes.bool,
  highlight: PropTypes.string,
  className: PropTypes.string,
};

export default FpGridListItem;
