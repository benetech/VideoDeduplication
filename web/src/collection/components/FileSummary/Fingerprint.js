import React from "react";
import PropTypes from "prop-types";
import AttributeText from "../../../common/components/AttributeText";
import { FileType } from "../../prop-types/FileType";
import { useIntl } from "react-intl";

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    fingerprint: intl.formatMessage({ id: "file.attr.fingerprint" }),
  };
}

function Fingerprint(props) {
  const { file, className, ...other } = props;
  const messages = useMessages();

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

Fingerprint.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType,
  className: PropTypes.string,
};

export default Fingerprint;
