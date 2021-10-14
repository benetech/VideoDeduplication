import React from "react";
import clsx from "clsx";
import useFile from "../../../application/api/files/useFile";
import { useIntl } from "react-intl";

/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    fileId: intl.formatMessage({
      id: "file.id",
    }),
  };
}

function FileRef(props: FileRefProps): JSX.Element {
  const { fileId, className, ...other } = props;
  const messages = useMessages();
  const { file } = useFile(fileId);

  if (!file) {
    return (
      <span className={clsx(className)} {...other}>
        {fileId} ({messages.fileId})
      </span>
    );
  }

  return (
    <span className={clsx(className)} {...other}>
      {file.filename}
    </span>
  );
}

type FileRefProps = {
  /**
   * File Id.
   */
  fileId: number;
  className?: string;
};
export default FileRef;
