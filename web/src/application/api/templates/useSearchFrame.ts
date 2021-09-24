import { useShowTask } from "../../../routing/hooks";
import { useCallback } from "react";
import TaskRequestTypes from "../../../prop-types/TaskRequestTypes";
import useRunTask from "../tasks/useRunTask";
import { FrameDescriptor } from "../../../model/VideoFile";

/**
 * Get search frame callback.
 */
export default function useSearchFrame(): (frame: FrameDescriptor) => void {
  const showTask = useShowTask();
  const runTask = useRunTask();

  return useCallback(async (frame: FrameDescriptor) => {
    try {
      const { file, time } = frame;
      const task = await runTask({
        type: TaskRequestTypes.FIND_FRAME,
        fileId: file.id,
        frameTimeMillis: time,
      });
      showTask(task);
    } catch (error) {
      console.error(error);
    }
  }, []);
}
