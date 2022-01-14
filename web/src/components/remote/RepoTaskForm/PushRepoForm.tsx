import React from "react";
import { RepoTaskFormProps } from "./RepoTaskDescriptor";
import { PushFingerprintsRequest } from "../../../model/Task";
import Description from "../../forms/Description";
import { useIntl } from "react-intl";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    description: intl.formatMessage({
      id: "task.type.pushFingerprints.description",
    }),
  };
}

export default function PushRepoForm(
  props: RepoTaskFormProps<PushFingerprintsRequest>
): JSX.Element {
  const { className } = props;
  const messages = useMessages();
  return (
    <div className={className}>
      <Description text={messages.description} />
    </div>
  );
}
