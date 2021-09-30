import React from "react";
import AttributeText from "../../basic/AttributeText";
import { VideoFile } from "../../../model/VideoFile";
import { useIntl } from "react-intl";

/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    owner: intl.formatMessage({
      id: "file.owner",
    }),
  };
}

function RemoteOwner(props: RemoteOwnerProps): JSX.Element | null {
  const { file, className, ...other } = props;
  const messages = useMessages();

  if (file == null) {
    return null;
  }

  return (
    <AttributeText
      name={messages.owner}
      value={file.contributor?.name}
      variant="primary"
      className={className}
      {...other}
    />
  );
}

type RemoteOwnerProps = {
  /**
   * Video file to be summarized.
   */
  file?: VideoFile;
  className?: string;
};
export default RemoteOwner;
