import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../../prop-types/FileType";
import FilterDramaOutlinedIcon from "@material-ui/icons/FilterDramaOutlined";
import PersonOutlineOutlinedIcon from "@material-ui/icons/PersonOutlineOutlined";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import IconButton from "@material-ui/core/IconButton";
import AttributeText from "../../../../common/components/AttributeText";
import { useIntl } from "react-intl";
import Marked from "../../../../common/components/Marked";
import FileGridListItemContainer from "./FileGridListItemContainer";
import LockIcon from "@material-ui/icons/Lock";

const useStyles = makeStyles((theme) => ({
  asButton: {
    cursor: "pointer",
  },
  preview: {
    height: theme.dimensions.gridItem.imageHeight,
    backgroundColor: theme.palette.common.black,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  disclaimer: {
    textAlign: "center",
    ...theme.mixins.captionText,
    color: theme.palette.primary.main,
    maxWidth: 120,
  },
  lockIcon: {
    margin: theme.spacing(1),
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
  description: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: theme.spacing(6),
    padding: theme.spacing(1),
    color: theme.palette.action.textInactive,
  },
  descriptionText: {
    marginRight: theme.spacing(1),
  },
  dividerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
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
    remoteFile: intl.formatMessage({ id: "file.remote" }),
    disclaimer: intl.formatMessage({ id: "file.remote.warning" }),
    attr: {
      filename: intl.formatMessage({ id: "file.attr.name" }),
      fingerprint: intl.formatMessage({ id: "file.attr.fingerprint" }),
      source: intl.formatMessage({ id: "file.source" }),
      owner: intl.formatMessage({ id: "file.owner" }),
      description: intl.formatMessage({ id: "file.attr.description" }),
    },
  };
}

const RemoteFileGridListItem = React.memo(function FpRemoteFileGridListItem(
  props
) {
  const {
    file,
    button = false,
    highlight,
    onClick,
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
      <div className={classes.preview}>
        <div className={classes.disclaimer}>
          <LockIcon className={classes.lockIcon} />
          <div>{messages.disclaimer}</div>
        </div>
      </div>
      <div className={classes.nameContainer}>
        <div className={classes.iconContainer}>
          <VideocamOutlinedIcon className={classes.icon} />
        </div>
        <div className={classes.name}>
          <Marked mark={highlight}>{file.hash}</Marked>
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
          name={messages.attr.source}
          value={file?.contributor?.repository?.name}
          icon={FilterDramaOutlinedIcon}
          defaultValue="Unknown"
          variant="primary"
          size="small"
        />
        <div className={classes.dividerContainer}>
          <div className={classes.divider} />
        </div>
        <AttributeText
          name={messages.attr.owner}
          value={file?.contributor?.name}
          icon={PersonOutlineOutlinedIcon}
          variant="primary"
          defaultValue="Unknown"
          size="small"
        />
      </div>
      <div className={classes.attrRow}>
        <AttributeText
          name={messages.attr.description}
          value={messages.remoteFile}
          icon={DescriptionOutlinedIcon}
          variant="normal"
          defaultValue="Unknown"
          size="small"
        />
      </div>
    </FileGridListItemContainer>
  );
});

RemoteFileGridListItem.propTypes = {
  /**
   * File which will be displayed.
   */
  file: FileType.isRequired,
  /**
   * Use cursor pointer style.
   */
  button: PropTypes.bool,
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

export default RemoteFileGridListItem;
