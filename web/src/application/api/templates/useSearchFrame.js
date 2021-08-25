import { useShowTask } from "../../../routing/hooks";
import { useCallback } from "react";
import TaskRequestTypes from "../../../prop-types/TaskRequestTypes";
import resolveValue from "../../../lib/helpers/resolveValue";
import useRunTask from "../tasks/useRunTask";

/**
 * @typedef {{
 *   file: FileEntity,
 *   time: number,
 * }} FrameDescriptor Video file and time position in milliseconds.
 */

/**
 * Handle search frame request.
 * @param {FrameDescriptor|(function(*):FrameDescriptor)|undefined} override
 * @param {*[]} deps override's dependencies
 * @return {function(*): Promise<void>}
 */
export default function useSearchFrame(override, deps = []) {
  const showTask = useShowTask();
  const runTask = useRunTask();

  return useCallback(async (value) => {
    try {
      const { file, time } = resolveValue(value, override);
      const task = await runTask({
        type: TaskRequestTypes.FIND_FRAME,
        fileId: file.id,
        frameTimeMillis: time,
      });
      showTask(task);
    } catch (error) {
      console.error(error);
    }
  }, deps);
}
