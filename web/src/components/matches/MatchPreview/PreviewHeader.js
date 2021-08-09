import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Marked from "../../basic/Marked";
import IconButton from "@material-ui/core/IconButton";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import { useIntl } from "react-intl";
import ActionType from "../../../prop-types/ActionType";
import usePopup from "../../../lib/hooks/usePopup";
import { Menu, MenuItem } from "@material-ui/core";
import clsx from "clsx";

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
function useMessages() {
  const intl = useIntl();
  return {
    moreOptions: intl.formatMessage({ id: "actions.showMoreOptions" }),
  };
}

function bindHandler(popup) {
  return (action) => () => {
    popup.onClose();
    action.handler();
  };
}

function PreviewHeader(props) {
  const {
    text,
    highlight,
    caption,
    icon: Icon,
    actions = [],
    className,
    ...other
  } = props;
  const messages = useMessages();
  const { clickTrigger, popup } = usePopup("match-actions-");
  const classes = useStyles();
  const handle = bindHandler(popup);

  return (
    <div className={clsx(classes.nameContainer, className)} {...other}>
      <div className={classes.iconContainer}>
        <Icon className={classes.icon} />
      </div>
      <div className={classes.nameAttr}>
        <div className={classes.caption}>{caption}</div>
        <div className={classes.name}>
          <Marked mark={highlight}>{text}</Marked>
        </div>
      </div>
      <IconButton
        size="small"
        aria-label={messages.moreOptions}
        {...clickTrigger}
      >
        <MoreHorizOutlinedIcon fontSize="small" />
      </IconButton>
      <Menu {...popup}>
        {actions.map((action) => (
          <MenuItem key={action.title} onClick={handle(action)}>
            {action.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

PreviewHeader.propTypes = {
  /**
   * Match header content.
   */
  text: PropTypes.string.isRequired,
  /**
   * File name substring to highlight
   */
  highlight: PropTypes.string,
  /**
   * Caption text.
   */
  caption: PropTypes.string.isRequired,
  /**
   * Icon to be displayed.
   */
  icon: PropTypes.elementType.isRequired,
  /**
   * Match actions array.
   */
  actions: PropTypes.arrayOf(ActionType),
  className: PropTypes.string,
};

export default PreviewHeader;
