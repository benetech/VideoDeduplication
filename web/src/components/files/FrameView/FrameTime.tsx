import React from "react";
import { useIntl } from "react-intl";
import { formatDuration } from "../../../lib/helpers/format";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import AttributeText from "../../basic/AttributeText";

/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    frameTime: intl.formatMessage({
      id: "task.attr.frameTime",
    }),
  };
}

function FrameTime(props: FrameTimeProps): JSX.Element {
  const { timeSec, className, ...other } = props;
  const messages = useMessages();
  const intl = useIntl();
  return (
    <AttributeText
      value={formatDuration(timeSec * 1000, intl, false)}
      icon={ScheduleOutlinedIcon}
      variant="normal"
      className={className}
      name={messages.frameTime}
      {...other}
    />
  );
}

type FrameTimeProps = {
  /**
   * Frame time in seconds.
   */
  timeSec: number;
  className?: string;
};
export default FrameTime;
