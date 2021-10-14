import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Menu, MenuItem, Theme } from "@material-ui/core";
import Marked from "../../basic/Marked";
import IconButton from "@material-ui/core/IconButton";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import { useIntl } from "react-intl";
import Action from "../../../model/Action";
import usePopup, { PopupOptions } from "../../../lib/hooks/usePopup";
import clsx from "clsx";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { SvgIconTypeMap } from "@material-ui/core/SvgIcon/SvgIcon";

const useStyles = makeStyles<Theme>((theme) => ({
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
  caption: { ...theme.mixins.captionText, marginBottom: theme.spacing(0.5) },
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
    moreOptions: intl.formatMessage({
      id: "actions.showMoreOptions",
    }),
  };
}

function bindHandler(
  popup: PopupOptions<HTMLButtonElement>
): (action: Action) => () => void {
  return (action: Action) => () => {
    popup.onClose();
    action.handler();
  };
}

function PreviewHeader(props: PreviewHeaderProps): JSX.Element {
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
  const { clickTrigger, popup } = usePopup<HTMLButtonElement>("match-actions-");
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

type PreviewHeaderProps = {
  /**
   * Match header content.
   */
  text: string;

  /**
   * File name substring to highlight
   */
  highlight?: string;

  /**
   * Caption text.
   */
  caption: string;

  /**
   * Icon to be displayed.
   */
  icon: OverridableComponent<SvgIconTypeMap>;

  /**
   * Match actions array.
   */
  actions?: Action[];
  className?: string;
};
export default PreviewHeader;
