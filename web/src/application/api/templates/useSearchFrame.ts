import { useShowTask } from "../../../routing/hooks";
import { useCallback } from "react";
import useRunTask from "../tasks/useRunTask";
import { FrameDescriptor } from "../../../model/VideoFile";
import { makeFindFrameRequest } from "../../../model/Task";

/**
 * Get search frame callback.
 */
export default function useSearchFrame(): (frame: FrameDescriptor) => void {
  const showTask = useShowTask();
  const runTask = useRunTask();

  return useCallback(async (frame: FrameDescriptor) => {
    try {
      const { file, time } = frame;
      const task = await runTask(
        makeFindFrameRequest({
          fileId: file.id,
          frameTimeMillis: time,
        })
      );
      showTask(task);
    } catch (error) {
      console.error(error);
    }
  }, []);
}
