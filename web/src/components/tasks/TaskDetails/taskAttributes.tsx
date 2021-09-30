import React from "react";
import ValueBadge from "../../basic/ValueBadge";
import getTaskTextDescription from "../TaskSummary/helpers/getTaskTextDescription";
import { format as formatDate, formatDistance } from "date-fns";
import getTaskStatusColorScheme from "../TaskSummary/helpers/getTaskStatusColorScheme";
import { Task } from "../../../model/Task";
import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";

export const dateFormat = "yyyy-MM-dd HH:mm:ss";

/**
 * General task attributes
 */
export const taskAttributes: AttributeRenderer<Task>[] = [
  {
    title: "task.id",
    value: (task) => task.id,
  },
  {
    title: "task.type",
    // eslint-disable-next-line react/display-name
    value: (task) => task?.request?.type,
  },
  {
    title: "task.description",
    // eslint-disable-next-line react/display-name
    value: (task, intl) => getTaskTextDescription(task.request, intl),
  },
  {
    title: "task.created",
    value: (task, intl) =>
      `${formatDate(task.submissionTime, dateFormat)} (${intl.formatMessage(
        { id: "task.time" },
        { time: formatDistance(task.submissionTime, new Date()) }
      )})`,
  },
  {
    title: "task.updated",
    value: (task, intl) =>
      `${formatDate(task.statusUpdateTime, dateFormat)} (${intl.formatMessage(
        { id: "task.time" },
        { time: formatDistance(task.statusUpdateTime, new Date()) }
      )})`,
  },
  {
    title: "task.status",
    // eslint-disable-next-line react/display-name
    value: (task) => (
      <ValueBadge
        value={task.status}
        color={getTaskStatusColorScheme(task.status)}
      />
    ),
  },
];
