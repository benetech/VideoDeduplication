import React from "react";
import clsx from "clsx";
import AttributeTable from "../../../basic/AttributeTable";
import { findFrameAttributes } from "../requestAttributes";
import { FindFrameRequest } from "../../../../model/Task";
import { TaskRequestViewProps } from "../model";

function FindFrameRequestAttrs(
  props: TaskRequestViewProps<FindFrameRequest>
): JSX.Element {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      value={task.request}
      attributes={findFrameAttributes}
      className={clsx(className)}
      {...other}
    />
  );
}

export default FindFrameRequestAttrs;
