import React from "react";
import PropTypes from "prop-types";
import { FileType } from "../../prop-types/FileType";
import CloudOutlinedIcon from "@material-ui/icons/CloudOutlined";
import { useIntl } from "react-intl";
import MainAttribute from "./MainAttribute";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    remoteHash: intl.formatMessage({ id: "file.attr.remoteHash" }),
  };
}

function RemoteHash(props) {
  const { file, highlight, className, ...other } = props;
  const messages = useMessages();

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

RemoteHash.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType,
  /**
   * Highlight substring.
   */
  highlight: PropTypes.string,
  className: PropTypes.string,
};

export default RemoteHash;
