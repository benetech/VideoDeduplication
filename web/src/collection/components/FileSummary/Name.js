import React from "react";
import PropTypes from "prop-types";
import { FileType } from "../../prop-types/FileType";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import { useIntl } from "react-intl";
import MainAttribute from "./MainAttribute";

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    filename: intl.formatMessage({ id: "file.attr.name" }),
  };
}

function Name(props) {
  const { file, highlight, className, ...other } = props;
  const messages = useMessages();

  return (
    <MainAttribute
      name={messages.filename}
      value={file.filename}
      icon={VideocamOutlinedIcon}
      highlight={highlight}
      className={className}
      {...other}
    />
  );
}

Name.propTypes = {
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

export default Name;
