import { Task, TaskRequest, TaskRequestMap } from "../../../model/Task";
import React from "react";

/**
 * Common props for task request component.
 */
export type TaskResultViewProps<TRequest extends TaskRequest = TaskRequest> = {
  task: Task<TRequest>;
  className?: string;
};

/**
 * Task request component.
 */
export type TaskResultViewComponent<
  TRequest extends TaskRequest = TaskRequest
> = React.ComponentType<TaskResultViewProps<TRequest>>;

/**
 * Task request view descriptor.
 */
export type TaskResultViewDescriptor<
  TRequest extends TaskRequest = TaskRequest
> = {
  title: string;
  component: TaskResultViewComponent<TRequest>;
};

/**
 * Mapping from task request type to the corresponding request views.
 */
export type TaskResultViewMap = {
  [type in keyof TaskRequestMap]: TaskResultViewDescriptor<
    TaskRequestMap[type]
  >[];
};
