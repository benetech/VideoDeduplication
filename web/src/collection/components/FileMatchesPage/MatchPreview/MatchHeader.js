import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import Marked from "../../../../common/components/Marked";
import IconButton from "@material-ui/core/IconButton";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  nameContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  nameAttr: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
  },
  icon: {
    color: theme.palette.common.black,
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  iconContainer: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: theme.spacing(1),
  },
  caption: {
    ...theme.mixins.captionText,
    marginBottom: theme.spacing(0.5),
  },
  name: {
    ...theme.mixins.textEllipsis,
    ...theme.mixins.title4,
    color: theme.palette.primary.main,
    fontWeight: "bold",
    flexGrow: 1,
  },
}));

/**
 * Get translated text.
 */
function useMessages(type) {
  const intl = useIntl();
  const caption = type === "local" ? "file.attr.name" : "file.attr.remoteHash";
  return {
    caption: intl.formatMessage({ id: caption }),
  };
}

function MatchHeader(props) {
  const { type, name, highlight, className, ...other } = props;
  const messages = useMessages(type);

  const classes = useStyles();
  return (
    <div className={classes.nameContainer} {...other}>
      <div className={classes.iconContainer}>
        <VideocamOutlinedIcon className={classes.icon} />
      </div>
      <div className={classes.nameAttr}>
        <div className={classes.caption}>{messages.caption}</div>
        <div className={classes.name}>
          <Marked mark={highlight}>{name}</Marked>
        </div>
      </div>
      <IconButton size="small" aria-label={messages.moreOptions}>
        <MoreHorizOutlinedIcon fontSize="small" />
      </IconButton>
    </div>
  );
}

MatchHeader.propTypes = {
  /**
   * Matched file type.
   */
  type: PropTypes.oneOf(["local", "remote"]).isRequired,
  /**
   * Match header content.
   */
  name: PropTypes.string.isRequired,
  /**
   * File name substring to highlight
   */
  highlight: PropTypes.string,
  className: PropTypes.string,
};

export default MatchHeader;
