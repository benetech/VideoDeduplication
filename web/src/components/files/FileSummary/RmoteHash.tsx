import React from "react";
import CloudOutlinedIcon from "@material-ui/icons/CloudOutlined";
import { useIntl } from "react-intl";
import MainAttribute from "./MainAttribute";
import { VideoFile } from "../../../model/VideoFile";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    remoteHash: intl.formatMessage({ id: "file.attr.remoteHash" }),
  };
}

function RemoteHash(props: RemoteHashProps): JSX.Element | null {
  const { file, highlight, className, ...other } = props;
  const messages = useMessages();

  if (file == null) {
    return null;
  }

  return (
    <MainAttribute
      name={messages.remoteHash}
      value={file.hash}
      icon={CloudOutlinedIcon}
      className={className}
      highlight={highlight}
      {...other}
    />
  );
}

type RemoteHashProps = {
  /**
   * Video file to be summarized.
   */
  file?: VideoFile;
  /**
   * Highlight substring.
   */
  highlight?: string;
  className?: string;
};

export default RemoteHash;
