import React from "react";
import AttributeText from "../../basic/AttributeText";
import { VideoFile } from "../../../model/VideoFile";
import { useIntl } from "react-intl";

/**
 * Get i18n text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    fingerprint: intl.formatMessage({
      id: "file.attr.fingerprint",
    }),
  };
}

function Fingerprint(props: FingerprintProps): JSX.Element | null {
  const { file, className, ...other } = props;
  const messages = useMessages();

  if (file == null) {
    return null;
  }

  return (
    <AttributeText
      name={messages.fingerprint}
      value={file.fingerprint && file.fingerprint.slice(0, 7)}
      variant="primary"
      className={className}
      {...other}
    />
  );
}

type FingerprintProps = {
  /**
   * Video file to be summarized.
   */
  file?: VideoFile;
  className?: string;
};
export default Fingerprint;
