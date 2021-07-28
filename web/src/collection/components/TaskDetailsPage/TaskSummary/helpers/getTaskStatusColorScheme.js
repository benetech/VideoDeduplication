import TaskStatus from "../../../../../application/state/tasks/TaskStatus";

export default function getTaskStatusColorScheme(status) {
  switch (status) {
    case TaskStatus.SUCCESS:
      return "success";
    case TaskStatus.PENDING:
    case TaskStatus.RUNNING:
      return "info";
    case TaskStatus.CANCELLED:
      return "warning";
    case TaskStatus.FAILURE:
      return "error";
    default:
      console.warn("Unsupported task status", status);
      return "secondary";
  }
}
