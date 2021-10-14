import React from "react";
import BaseTimeCaption from "./BaseTimeCaption";

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
