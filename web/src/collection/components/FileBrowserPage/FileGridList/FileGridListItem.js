import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../../prop-types/FileType";
import MediaPreview from "../../../../common/components/MediaPreview";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import IconButton from "@material-ui/core/IconButton";
import AttributeText from "../../../../common/components/AttributeText";
import { useIntl } from "react-intl";
import {
  formatBool,
  formatDate,
  formatDuration,
} from "../../../../common/helpers/format";
import EventAvailableOutlinedIcon from "@material-ui/icons/EventAvailableOutlined";
import ExifIcon from "../../../../common/components/icons/ExifIcon";
import VolumeOffOutlinedIcon from "@material-ui/icons/VolumeOffOutlined";
import Marked from "../../../../common/components/Marked";
import FileGridListItemContainer from "./FileGridListItemContainer";

const useStyles = makeStyles((theme) => ({
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
    ...theme.mixins.textEllipsis,
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

const FileGridListItem = React.memo(function FpGridListItem(props) {
  const {
    file,
    button = false,
    dense = false,
    highlight,
    onClick,
    blur = true,
    className,
  } = props;

  const intl = useIntl();
  const messages = useMessages(intl);
  const handleClick = useCallback(() => onClick(file), [file, onClick]);

  /**
   * Support keyboard actions
   */
  const handleKeyDown = useCallback(
    (event) => {
      const key = event.key;
      if (key === " " || key === "Enter") {
        event.preventDefault();
        onClick(file);
      }
    },
    [onClick]
  );

  const classes = useStyles();
  return (
    <FileGridListItemContainer
      className={clsx(button && classes.asButton, className)}
      dense={dense}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={intl.formatMessage({ id: "actions.showFileDetails" })}
      data-selector="FileGridListItem"
      data-file-id={file.id}
    >
      <MediaPreview
        src={file.preview}
        alt="preview"
        blur={blur}
        className={classes.preview}
      />
      <div className={classes.nameContainer}>
        <div className={classes.iconContainer}>
          <VideocamOutlinedIcon className={classes.icon} />
        </div>
        <div className={classes.name}>
          <Marked mark={highlight}>{file.filename}</Marked>
        </div>
        <IconButton
          size="small"
          aria-label={intl.formatMessage({ id: "actions.showMoreOptions" })}
        >
          <MoreHorizOutlinedIcon fontSize="small" />
        </IconButton>
      </div>
      <div className={classes.attrRow}>
        <AttributeText
          name={messages.attr.fingerprint}
          value={file.fingerprint && file.fingerprint.slice(0, 7)}
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
    </FileGridListItemContainer>
  );
});

FileGridListItem.propTypes = {
  /**
   * File which will be displayed.
   */
  file: FileType.isRequired,
  /**
   * Use cursor pointer style.
   */
  button: PropTypes.bool,
  /**
   * Use more compact layout.
   */
  dense: PropTypes.bool,
  /**
   * Highlight name substring.
   */
  highlight: PropTypes.string,
  /**
   * Handle item click.
   */
  onClick: PropTypes.func,
  /**
   * Control preview blur.
   */
  blur: PropTypes.bool,
  className: PropTypes.string,
};

export default FileGridListItem;
