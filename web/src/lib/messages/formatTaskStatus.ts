import { IntlShape } from "react-intl";
import { TaskStatus } from "../../model/Task";

/**
 * Translate task status to human readable text.
 */
export default function formatTaskStatus(
  status: TaskStatus,
  intl: IntlShape
): string {
  switch (status) {
    case TaskStatus.PENDING:
      return intl.formatMessage({
        id: "task.status.pending",
      });

    case TaskStatus.RUNNING:
      return intl.formatMessage({
        id: "task.status.running",
      });

    case TaskStatus.SUCCESS:
      return intl.formatMessage({
        id: "task.status.success",
      });

    case TaskStatus.FAILURE:
      return intl.formatMessage({
        id: "task.status.failure",
      });

    case TaskStatus.CANCELLED:
      return intl.formatMessage({
        id: "task.status.cancelled",
      });
  }
}
