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
    repository: intl.formatMessage({
      id: "file.source",
    }),
  };
}

function RemoteRepo(props: RemoteRepoProps): JSX.Element | null {
  const { file, className, ...other } = props;
  const messages = useMessages();

  if (file == null) {
    return null;
  }

  return (
    <AttributeText
      name={messages.repository}
      value={file.contributor?.repository?.name}
      variant="primary"
      className={className}
      {...other}
    />
  );
}

type RemoteRepoProps = {
  /**
   * Video file to be summarized.
   */
  file?: VideoFile;
  className?: string;
};
export default RemoteRepo;
