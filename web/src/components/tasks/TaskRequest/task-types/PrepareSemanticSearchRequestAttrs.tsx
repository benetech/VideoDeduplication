import React from "react";
import clsx from "clsx";
import AttributeTable from "../../../basic/AttributeTable";
import { prepareSemanticSearchAttributes } from "../requestAttributes";
import { PrepareSemanticSearchRequest } from "../../../../model/Task";
import { TaskRequestViewProps } from "../model";

export default function PrepareSemanticSearchRequestAttrs(
  props: TaskRequestViewProps<PrepareSemanticSearchRequest>
): JSX.Element {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={task.request}
      attributes={prepareSemanticSearchAttributes}
      {...other}
    />
  );
}
