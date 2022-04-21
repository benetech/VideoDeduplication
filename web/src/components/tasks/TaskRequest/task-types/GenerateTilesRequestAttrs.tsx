import { TaskRequestViewProps } from "../model";
import { GenerateTilesRequest } from "../../../../model/Task";
import AttributeTable from "../../../basic/AttributeTable";
import clsx from "clsx";
import { generateTilesAttributes } from "../requestAttributes";
import React from "react";

export default function GenerateTilesRequestAttrs(
  props: TaskRequestViewProps<GenerateTilesRequest>
): JSX.Element {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={task.request}
      attributes={generateTilesAttributes}
      {...other}
    />
  );
}
