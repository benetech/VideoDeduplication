import React from "react";
import PropTypes from "prop-types";
import AttributeText from "../../../common/components/AttributeText";
import { FileType } from "../../prop-types/FileType";
import { useIntl } from "react-intl";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    owner: intl.formatMessage({ id: "file.owner" }),
  };
}

function RemoteOwner(props) {
  const { file, className, ...other } = props;
  const messages = useMessages();

  return (
    <AttributeText
      name={messages.owner}
      value={file?.contributor?.name}
      variant="primary"
      className={className}
      {...other}
    />
  );
}

RemoteOwner.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType,
  className: PropTypes.string,
};

export default RemoteOwner;
