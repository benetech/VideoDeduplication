import React from "react";
import PropTypes from "prop-types";
import AttributeText from "../../../common/components/AttributeText";
import { FileType } from "../FileBrowserPage/FileType";
import { useIntl } from "react-intl";

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    filename: intl.formatMessage({ id: "file.attr.name" }),
    fingerprint: intl.formatMessage({ id: "file.attr.fingerprint" }),
    quality: intl.formatMessage({ id: "file.attr.quality" }),
    goBack: intl.formatMessage({ id: "actions.goBack" }),
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
