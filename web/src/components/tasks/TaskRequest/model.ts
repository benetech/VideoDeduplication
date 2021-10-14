import { Task, TaskRequest, TaskRequestMap } from "../../../model/Task";
import React from "react";

/**
 * Common props for task request component.
 */
export type TaskRequestViewProps<TRequest extends TaskRequest = TaskRequest> = {
  task: Task<TRequest>;
  className?: string;
};

/**
 * Task request component.
 */
export type TaskRequestViewComponent<
  TRequest extends TaskRequest = TaskRequest
> = React.ComponentType<TaskRequestViewProps<TRequest>>;

/**
 * Task request view descriptor.
 */
export type TaskRequestViewDescriptor<
  TRequest extends TaskRequest = TaskRequest
> = {
  title: string;
  component: TaskRequestViewComponent<TRequest>;
};

/**
 * Mapping from task request type to the corresponding request views.
 */
export type RequestViewMap = {
  [type in keyof TaskRequestMap]: TaskRequestViewDescriptor<
    TaskRequestMap[type]
  >[];
};
