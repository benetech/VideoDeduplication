import React from "react";
import { formatDate } from "../../../lib/helpers/format";
import EventAvailableOutlinedIcon from "@material-ui/icons/EventAvailableOutlined";
import AttributeText from "../../basic/AttributeText";
import { VideoFile } from "../../../model/VideoFile";
import { useIntl } from "react-intl";

function CreationDate(props: CreationDateProps): JSX.Element | null {
  const { file, className, ...other } = props;
  const intl = useIntl();

  if (file == null || file.metadata == null) {
    return null;
  }

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

type CreationDateProps = {
  /**
   * Video file to be summarized.
   */
  file?: VideoFile;
  className?: string;
};
export default CreationDate;
