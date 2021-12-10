import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import { useIntl } from "react-intl";
import Spacer from "../../components/basic/Spacer";
import PlaylistAddCheckOutlinedIcon from "@material-ui/icons/PlaylistAddCheckOutlined";
import Title from "../../components/basic/Title";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "repos.shareFingerprints" }),
    showTasks: intl.formatMessage({
      id: "actions.showTasks",
    }),
    hideTasks: intl.formatMessage({
      id: "actions.hideTasks",
    }),
  };
}

type RepositoriesPageHeaderProps = {
  onShowTasks: () => void;
  showTasks: boolean;
  className?: string;
};

function RepositoriesPageHeader(
  props: RepositoriesPageHeaderProps
): JSX.Element {
  const { showTasks, onShowTasks, className, ...other } = props;
  const messages = useMessages();

  return (
    <Title text={messages.title} className={className} {...other}>
      <Spacer />
      {!showTasks && (
        <Tooltip title={messages.showTasks}>
          <IconButton
            color="inherit"
            onClick={onShowTasks}
            aria-label={messages.showTasks}
          >
            <PlaylistAddCheckOutlinedIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
      )}
    </Title>
  );
}

export default RepositoriesPageHeader;
