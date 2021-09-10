import TaskRequestTypes from "../../../../prop-types/TaskRequestTypes";

/**
 * Check if the action is the match-templates task results.
 * @param {TaskEntity} task
 * @return {boolean}
 */
export default function isMatchTemplatesResults(task) {
  return (
    task.request.type === TaskRequestTypes.MATCH_TEMPLATES &&
    task.result?.fileCounts
  );
}
