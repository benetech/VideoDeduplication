import Title from "../../basic/Title";
import Spacer from "../../basic/Spacer";
import { IconButton, Tooltip } from "@material-ui/core";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import React from "react";
import { useIntl } from "react-intl";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    process: intl.formatMessage({
      id: "templates.process",
    }),
    hideTasks: intl.formatMessage({
      id: "actions.hideTasks",
    }),
  };
}

type TasksSidebarHeaderProps = {
  /**
   * Handle task close.
   */
  onClose: () => void;
  className?: string;
};

export default function TasksSidebarHeader(
  props: TasksSidebarHeaderProps
): JSX.Element {
  const { onClose, className, ...other } = props;
  const messages = useMessages();
  return (
    <Title text={messages.process} className={className} {...other}>
      <Spacer />
      <Tooltip title={messages.hideTasks}>
        <IconButton
          color="inherit"
          onClick={onClose}
          aria-label={messages.hideTasks}
        >
          <CloseOutlinedIcon color="inherit" fontSize="large" />
        </IconButton>
      </Tooltip>
    </Title>
  );
}
