import React from "react";
import { CheckStatus } from "./helpers/useCheckCredentials";
import CircularProgress from "@material-ui/core/CircularProgress";
import ValueBadge from "../../components/basic/ValueBadge";
import { useIntl } from "react-intl";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    available: intl.formatMessage({ id: "status.available" }),
    unavailable: intl.formatMessage({ id: "status.unavailable" }),
  };
}

type RepoCheckStatusProps = {
  status: CheckStatus;
  className?: string;
};

export default function RepoCheckStatus(
  props: RepoCheckStatusProps
): JSX.Element | null {
  const { status, className } = props;
  const messages = useMessages();

  switch (status) {
    case CheckStatus.UNKNOWN:
      return null;
    case CheckStatus.LOADING:
      return (
        <CircularProgress color="primary" size={20} className={className} />
      );
    case CheckStatus.CONFIRMED:
      return (
        <ValueBadge
          value={messages.available}
          color="success"
          className={className}
        />
      );
    case CheckStatus.UNCONFIRMED:
      return (
        <ValueBadge
          value={messages.unavailable}
          color="error"
          className={className}
        />
      );
  }
}
