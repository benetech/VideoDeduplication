import React from "react";
import PropTypes from "prop-types";
import { formatBool } from "../../../common/helpers/format";
import ExifIcon from "../../../common/components/icons/ExifIcon";
import AttributeText from "../../../common/components/AttributeText";
import { FileType } from "../../prop-types/FileType";
import { useIntl } from "react-intl";

function HasExif(props) {
  const { file, className, ...other } = props;
  const intl = useIntl();

  return (
    <AttributeText
      value={formatBool(file.metadata.hasEXIF, intl)}
      icon={ExifIcon}
      variant="primary"
      className={className}
      {...other}
    />
  );
}

HasExif.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType,
  className: PropTypes.string,
};

export default HasExif;
