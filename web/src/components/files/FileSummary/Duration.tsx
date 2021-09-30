import React from "react";
import { formatDuration } from "../../../lib/helpers/format";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import AttributeText from "../../basic/AttributeText";
import { VideoFile } from "../../../model/VideoFile";
import { useIntl } from "react-intl";

function Duration(props: DurationProps): JSX.Element | null {
  const { file, className, ...other } = props;
  const intl = useIntl();

  if (file == null) {
    return null;
  }

  return (
    <AttributeText
      value={formatDuration(file.metadata?.length || 0, intl, false)}
      icon={ScheduleOutlinedIcon}
      variant="normal"
      className={className}
      {...other}
    />
  );
}

type DurationProps = {
  /**
   * Video file to be summarized.
   */
  file?: VideoFile;
  className?: string;
};
export default Duration;
