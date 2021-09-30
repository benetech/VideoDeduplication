import { TaskStatus } from "../../../../model/Task";
import { ColorVariant } from "../../../../lib/types/ColorVariant";

export default function getTaskStatusColorScheme(
  status: TaskStatus
): ColorVariant {
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
  }
}
