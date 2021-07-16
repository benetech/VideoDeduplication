import TaskRequest from "../../../../state/tasks/TaskRequest";

/**
 * Get Task text description.
 */
export default function getTaskTextDescription(request, intl) {
  switch (request.type) {
    case TaskRequest.DIRECTORY:
      if (request.directory === ".") {
        return intl.formatMessage({ id: "task.type.all" });
      } else {
        return request.directory;
      }
    case TaskRequest.FILE_LIST: {
      const count = request.files.length;
      const files = intl.formatMessage({
        id: count === 1 ? "file.one" : "file.many",
      });
      return intl.formatMessage(
        { id: "actions.process" },
        { what: `${count} ${files}` }
      );
    }
    case TaskRequest.MATCH_TEMPLATES:
      return intl.formatMessage({ id: "task.type.templates" });
    case TaskRequest.FIND_FRAME:
      return intl.formatMessage({ id: "actions.findFrame" });
    case TaskRequest.PROCESS_ONLINE_VIDEO:
      return intl.formatMessage({ id: "task.type.processOnline" });
    default:
      console.warn(`Unsupported task request type: ${request.type}`);
      return request.type;
  }
}
