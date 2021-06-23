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
import { formatDate, formatDuration } from "../../../../common/helpers/format";
import EventAvailableOutlinedIcon from "@material-ui/icons/EventAvailableOutlined";
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
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(3),
    height: theme.spacing(3),
    flexShrink: 0,
    padding: theme.spacing(0.5),
    marginRight: theme.spacing(1),
  },
  attrRow: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    justifyContent: "space-between",
  },
  divider: {
    borderLeftStyle: "solid",
    borderLeftColor: theme.palette.border.light,
    borderLeftWidth: 1,
    height: theme.spacing(4),
  },
  volume: {
    fontSize: 20,
    color: theme.palette.action.textInactive,
    marginRight: theme.spacing(1),
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

const LocalFileGridListItem = React.memo(function FpLocalFileGridListItem(
  props
) {
  const {
    file,
    button = false,
    highlight,
    onClick,
    blur = true,
    perRow = 4,
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
      perRow={perRow}
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
        <VideocamOutlinedIcon className={classes.icon} />
        <Marked mark={highlight} className={classes.name}>
          {file.filename}
        </Marked>
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
        <div className={classes.divider} />
        <AttributeText
          name={messages.attr.quality}
          value={file.metadata.quality}
          defaultValue="Unknown"
          variant="primary"
          size="small"
        />
        <div className={classes.divider} />
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
        <div className={classes.divider} />
        <VolumeOffOutlinedIcon className={classes.volume} />
      </div>
    </FileGridListItemContainer>
  );
});

LocalFileGridListItem.propTypes = {
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
   * Control preview blur.
   */
  blur: PropTypes.bool,
  /**
   * List item click handler.
   */
  onClick: PropTypes.func.isRequired,
  /**
   * How many items will be displayed per row.
   */
  perRow: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default LocalFileGridListItem;
