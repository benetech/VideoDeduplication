import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Theme, Tooltip } from "@material-ui/core";
import Spacer from "../../basic/Spacer";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import Title from "../../basic/Title";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>((theme) => ({
  sidebarHeader: {
    marginBottom: theme.spacing(3),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    defaultCloseTooltip: intl.formatMessage({ id: "actions.showSidebar" }),
  };
}

type SidebarHeaderProps = {
  title?: string;
  closeTooltip?: string;
  children?: React.ReactNode;
  onToggle?: (value: boolean) => void;
  className?: string;
};

function SidebarHeader(props: SidebarHeaderProps): JSX.Element {
  const {
    title = "",
    closeTooltip,
    onToggle,
    children,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const handleClose = useCallback(() => {
    if (onToggle != null) onToggle(false);
  }, [onToggle]);

  return (
    <Title
      text={title}
      className={clsx(classes.sidebarHeader, className)}
      variant="title"
      {...other}
    >
      {children}
      {onToggle && (
        <React.Fragment>
          <Spacer />
          <Tooltip title={closeTooltip || messages.defaultCloseTooltip}>
            <IconButton
              color="inherit"
              onClick={handleClose}
              aria-label={closeTooltip || messages.defaultCloseTooltip}
            >
              <CloseOutlinedIcon color="inherit" fontSize="large" />
            </IconButton>
          </Tooltip>
        </React.Fragment>
      )}
    </Title>
  );
}

export default SidebarHeader;
