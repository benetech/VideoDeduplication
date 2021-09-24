import { InfiniteData, useQueryClient } from "react-query";
import { useCallback } from "react";
import PagedResultsBuilder from "../../common/PagedResultsBuilder";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";
import { Task, TaskFilters } from "../../../model/Task";
import { ListTasksResults } from "../../../server-api/ServerAPI";

/**
 * Callback to update task data on frontend.
 */
export type UpdateTaskDataFn = (task: Task) => void;

/**
 * Get a callback to update task.
 * This function will only update task data on client.
 */
export default function useUpdateTaskData(): UpdateTaskDataFn {
  const queryClient = useQueryClient();

  return useCallback(
    (task) => {
      const updater = (data?: InfiniteData<ListTasksResults>) =>
        new PagedResultsBuilder<Task, TaskFilters>(
          data,
          checkTaskFilters,
          makeTaskComparator
        ).addEntity(task).results as InfiniteData<ListTasksResults>;
      queryClient.setQueriesData<InfiniteData<ListTasksResults>>(
        ["tasks"],
        updater
      );
      queryClient.setQueryData(["task", task.id], task);
    },
    [queryClient]
  );
}
