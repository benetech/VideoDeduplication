import React from "react";
import PropTypes from "prop-types";
import { formatDuration } from "../../../common/helpers/format";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import AttributeText from "../../../common/components/AttributeText";
import { FileType } from "../../../prop-types/FileType";

function Duration(props) {
  const { file, className, ...other } = props;

  return (
    <AttributeText
      value={formatDuration(file.metadata.length, null, false)}
      icon={ScheduleOutlinedIcon}
      variant="normal"
      className={className}
      {...other}
    />
  );
}

Duration.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType,
  className: PropTypes.string,
};

export default Duration;
