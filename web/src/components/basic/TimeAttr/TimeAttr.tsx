import React from "react";
import { formatDuration } from "../../../lib/helpers/format";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import AttributeText from "../AttributeText";
import { useIntl } from "react-intl";

function TimeAttr(props: TimeAttrProps): JSX.Element {
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

type TimeAttrProps = {
  /**
   * Title to be displayed.
   */
  title?: string;

  /**
   * Time position in milli-seconds that will be displayed.
   */
  time: number;
  className?: string;
};
export default TimeAttr;
