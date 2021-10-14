import { TaskRequest, TaskRequestType } from "../../../model/Task";

/**
 * Common properties for task builder components.
 */
export type TaskBuilderProps<TRequest extends TaskRequest = TaskRequest> = {
  /** Current request. */
  request: TRequest;
  /** Handle request change */
  onChange: (request: TaskRequest) => void;
  valid: boolean;
  onValidated: (valid: boolean) => void;
  className?: string;
};

/**
 * Base type for task builder forms.
 */
export type TaskBuilderComponent = (
  props: TaskBuilderProps
) => JSX.Element | null;

/**
 * Task view descriptor associates task type with a task view component.
 */
export type TaskViewDescriptor = {
  type: TaskRequestType;
  title: string;
};
