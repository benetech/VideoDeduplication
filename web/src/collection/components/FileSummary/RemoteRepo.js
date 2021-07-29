import React from "react";
import PropTypes from "prop-types";
import AttributeText from "../../../common/components/AttributeText";
import { FileType } from "../../../prop-types/FileType";
import { useIntl } from "react-intl";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    repository: intl.formatMessage({ id: "file.source" }),
  };
}

function RemoteRepo(props) {
  const { file, className, ...other } = props;
  const messages = useMessages();

  return (
    <AttributeText
      name={messages.repository}
      value={file?.contributor?.repository?.name}
      variant="primary"
      className={className}
      {...other}
    />
  );
}

RemoteRepo.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType,
  className: PropTypes.string,
};

export default RemoteRepo;
