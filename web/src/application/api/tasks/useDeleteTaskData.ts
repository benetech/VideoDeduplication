import { InfiniteData, useQueryClient } from "react-query";
import { useCallback } from "react";
import PagedResultsBuilder from "../../common/PagedResultsBuilder";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";
import { Task, TaskFilters } from "../../../model/Task";
import getEntityId from "../../../lib/entity/getEntityId";
import { ListTasksResults } from "../../../server-api/ServerAPI";

/**
 * Callback for task data deletion.
 */
export type DeleteTaskDataFn = (task: Task | Task["id"]) => void;

/**
 * Get a callback to delete task data.
 * This function will only delete task data on client.
 */
export default function useDeleteTaskData(): DeleteTaskDataFn {
  const queryClient = useQueryClient();

  return useCallback(
    (task: Task | Task["id"]) => {
      const updater = (data?: InfiniteData<ListTasksResults>) =>
        new PagedResultsBuilder<Task, TaskFilters>(
          data,
          checkTaskFilters,
          makeTaskComparator
        ).deleteEntity(task).results as InfiniteData<ListTasksResults>;
      queryClient.setQueriesData<InfiniteData<ListTasksResults>>(
        ["tasks"],
        updater
      );
      queryClient
        .invalidateQueries(["task", getEntityId(task)])
        .catch(console.error);
    },
    [queryClient]
  );
}
