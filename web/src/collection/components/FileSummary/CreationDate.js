import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "../../../common/helpers/format";
import EventAvailableOutlinedIcon from "@material-ui/icons/EventAvailableOutlined";
import AttributeText from "../../../common/components/AttributeText";
import { FileType } from "../../prop-types/FileType";
import { useIntl } from "react-intl";

function CreationDate(props) {
  const { file, className, ...other } = props;
  const intl = useIntl();

  return (
    <AttributeText
      value={formatDate(file.metadata.created, intl)}
      icon={EventAvailableOutlinedIcon}
      variant="normal"
      defaultValue="Unknown"
      className={className}
      {...other}
    />
  );
}

CreationDate.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType,
  className: PropTypes.string,
};

export default CreationDate;
