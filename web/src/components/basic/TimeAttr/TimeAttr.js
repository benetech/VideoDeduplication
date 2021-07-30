import React from "react";
import PropTypes from "prop-types";
import { formatDuration } from "../../../lib/helpers/format";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import AttributeText from "../AttributeText";
import { useIntl } from "react-intl";

function TimeAttr(props) {
  const { time, title, className, ...other } = props;
  const intl = useIntl();

  return (
    <AttributeText
      value={formatDuration(time, intl, false)}
      icon={ScheduleOutlinedIcon}
      variant="normal"
      className={className}
      name={title}
      {...other}
    />
  );
}

TimeAttr.propTypes = {
  /**
   * Title to be displayed.
   */
  title: PropTypes.string,
  /**
   * Time position in milli-seconds that will be displayed.
   */
  time: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default TimeAttr;
