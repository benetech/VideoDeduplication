import React from "react";
import { CircularProgress, Tooltip } from "@material-ui/core";
import { useIntl } from "react-intl";
import IconButton from "@material-ui/core/IconButton";
import UpdateIcon from "@material-ui/icons/Update";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    synchronize: intl.formatMessage({ id: "actions.synchronize" }),
  };
}

type SyncButtonProps = {
  onClick: () => void;
  loading?: boolean;
  className?: string;
};

export default function SyncButton(props: SyncButtonProps): JSX.Element {
  const { onClick, loading, className } = props;
  const messages = useMessages();

  if (loading) {
    return <CircularProgress color="primary" size={35} className={className} />;
  }

  return (
    <Tooltip title={messages.synchronize}>
      <IconButton size="small" onClick={onClick} className={className}>
        <UpdateIcon />
      </IconButton>
    </Tooltip>
  );
}
