import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Theme, Tooltip } from "@material-ui/core";
import { useIntl } from "react-intl";
import PlaylistAddCheckOutlinedIcon from "@material-ui/icons/PlaylistAddCheckOutlined";

const useStyles = makeStyles<Theme>({
  sidebarToggle: {
    flexGrow: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    defaultTooltip: intl.formatMessage({ id: "actions.showSidebar" }),
  };
}

type SidebarToggleProps = {
  sidebar: boolean;
  onToggle: (value: boolean) => void;
  tooltip?: string;
  className?: string;
};

function SidebarToggle(props: SidebarToggleProps): JSX.Element | null {
  const { sidebar, onToggle, tooltip, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  const handleToggle = useCallback(
    () => onToggle(!sidebar),
    [sidebar, onToggle]
  );

  if (sidebar) {
    return null;
  }

  return (
    <div className={clsx(classes.sidebarToggle, className)} {...other}>
      <Tooltip title={tooltip || messages.defaultTooltip}>
        <IconButton
          color="inherit"
          onClick={handleToggle}
          aria-label={tooltip || messages.defaultTooltip}
        >
          <PlaylistAddCheckOutlinedIcon color="inherit" fontSize="large" />
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default SidebarToggle;
