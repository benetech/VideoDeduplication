import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import AccessTimeOutlinedIcon from "@material-ui/icons/AccessTimeOutlined";
import { formatDuration } from "../../lib/helpers/format";
import { useIntl } from "react-intl";
import BaseTimeCaption from "./BaseTimeCaption";

const useStyles = makeStyles<Theme>((theme) => ({
  position: {
    ...theme.mixins.textSmall,
    color: theme.palette.common.white,
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing(0.5),
  },
}));
/**
 * Represent a time position inside a video file.
 */

function TimeCaption(props: TimeCaptionProps): JSX.Element {
  const { time, className } = props;
  return (
    <BaseTimeCaption
      time={time}
      className={className}
      component="div"
      componentProps={{}}
    />
  );
}

type TimeCaptionProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Time in milliseconds.
   */
  time: number;
};

export default TimeCaption;
