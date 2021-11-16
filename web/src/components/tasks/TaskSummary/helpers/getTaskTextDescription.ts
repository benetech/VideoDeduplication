import { IntlShape } from "react-intl";
import { TaskRequest, TaskRequestType } from "../../../../model/Task";

/**
 * Get Task text description.
 */
export default function getTaskTextDescription(
  request: TaskRequest,
  intl: IntlShape
): string {
  switch (request.type) {
    case TaskRequestType.DIRECTORY:
      if (request.directory === ".") {
        return intl.formatMessage({ id: "task.type.all" });
      } else {
        return request.directory;
      }
    case TaskRequestType.FILE_LIST: {
      const count = request.files.length;
      const files = intl.formatMessage({
        id: count === 1 ? "file.one" : "file.many",
      });
      return intl.formatMessage(
        { id: "actions.process" },
        { what: `${count} ${files}` }
      );
    }
    case TaskRequestType.MATCH_TEMPLATES:
      return intl.formatMessage({ id: "task.type.templates" });
    case TaskRequestType.FIND_FRAME:
      return intl.formatMessage({ id: "actions.findFrame" });
    case TaskRequestType.PROCESS_ONLINE_VIDEO:
      return intl.formatMessage({ id: "task.type.processOnline" });
  }
}