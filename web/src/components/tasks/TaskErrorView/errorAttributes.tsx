import React from "react";
import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";
import { TaskError } from "../../../model/Task";
import ValueBadge from "../../basic/ValueBadge";

const errorAttributes: AttributeRenderer<TaskError>[] = [
  {
    title: "error.class",
    value: (error) => (
      <ValueBadge color="error" uppercase={false} value={error.type} />
    ),
  },
  {
    title: "error.module",
    value: (error) => error.module,
  },
  {
    title: "error.message",
    value: (error) => error.message,
  },
];

export default errorAttributes;
