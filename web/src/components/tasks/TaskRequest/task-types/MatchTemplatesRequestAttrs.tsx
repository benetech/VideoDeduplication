import React from "react";
import clsx from "clsx";
import AttributeTable from "../../../basic/AttributeTable";
import { matchTemplatesAttributes } from "../requestAttributes";
import { MatchTemplatesRequest } from "../../../../model/Task";
import { TaskRequestViewProps } from "../model";

function MatchTemplatesRequestAttrs(
  props: TaskRequestViewProps<MatchTemplatesRequest>
): JSX.Element {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={task.request}
      attributes={matchTemplatesAttributes}
      {...other}
    />
  );
}

export default MatchTemplatesRequestAttrs;
