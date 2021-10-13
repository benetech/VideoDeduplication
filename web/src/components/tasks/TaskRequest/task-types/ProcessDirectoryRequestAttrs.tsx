import React from "react";
import clsx from "clsx";
import AttributeTable from "../../../basic/AttributeTable";
import { processDirectoryAttributes } from "../requestAttributes";
import { ProcessDirectoryRequest } from "../../../../model/Task";
import { TaskRequestViewProps } from "../model";

function ProcessDirectoryRequestAttrs(
  props: TaskRequestViewProps<ProcessDirectoryRequest>
): JSX.Element {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={task.request}
      attributes={processDirectoryAttributes}
      {...other}
    />
  );
}

export default ProcessDirectoryRequestAttrs;
