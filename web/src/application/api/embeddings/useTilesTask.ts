import {
  GenerateTilesRequest,
  Task,
  TaskRequestType,
  TaskStatus,
} from "../../../model/Task";
import { Nullable } from "../../../lib/types/util-types";
import { EmbeddingAlgorithm } from "../../../model/embeddings";
import useTasksLazy from "../tasks/useTasksLazy";
import { useMemo } from "react";

/**
 * Get active tiles task.
 */
export default function useTilesTask(
  algorithm: EmbeddingAlgorithm
): Nullable<Task> {
  const query = useTasksLazy();
  return useMemo<Nullable<Task<GenerateTilesRequest>>>(() => {
    for (const page of query.pages) {
      for (const task of page) {
        if (
          task.status === TaskStatus.RUNNING &&
          task.request.type === TaskRequestType.GENERATE_TILES &&
          task.request.algorithm === algorithm
        ) {
          return task as Task<GenerateTilesRequest>;
        }
      }
    }
  }, [query.pages]);
}
