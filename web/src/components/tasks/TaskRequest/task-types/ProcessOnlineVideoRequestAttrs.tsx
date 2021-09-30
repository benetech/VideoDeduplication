import React from "react";
import clsx from "clsx";
import AttributeTable from "../../../basic/AttributeTable";
import { processOnlineVideoAttributes } from "../requestAttributes";
import { ProcessOnlineVideoRequest } from "../../../../model/Task";
import { TaskRequestViewProps } from "../model";

function ProcessOnlineVideoRequestAttrs(
  props: TaskRequestViewProps<ProcessOnlineVideoRequest>
): JSX.Element {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={task.request}
      attributes={processOnlineVideoAttributes}
      {...other}
    />
  );
}

export default ProcessOnlineVideoRequestAttrs;
