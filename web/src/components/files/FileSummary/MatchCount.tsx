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
    duplicates: intl.formatMessage({ id: "file.attr.duplicatesCount" }),
    related: intl.formatMessage({ id: "file.attr.relatedCount" }),
    unknown: intl.formatMessage({ id: "value.unknown" }),
  };
}

type MatchCountProps = {
  /**
   * Video file to be summarized.
   */
  file?: VideoFile;
  className?: string;
};

function MatchCount(props: MatchCountProps): JSX.Element | null {
  const { file, className, ...other } = props;
  const messages = useMessages();

  if (file == null) {
    return null;
  }

  return (
    <AttributeText
      name={`${messages.duplicates}/${messages.related}`}
      value={`${file.duplicatesCount || 0}/${file.relatedCount || 0}`}
      variant="normal"
      className={className}
      {...other}
    />
  );
}
export default MatchCount;
