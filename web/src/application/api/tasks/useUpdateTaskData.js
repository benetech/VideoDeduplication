import { useQueryClient } from "react-query";
import { useCallback } from "react";
import PagedResultsBuilder from "../../common/react-query/PagedResultsBuilder";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";

/**
 * Get a callback to update task.
 * This function will only update task data on client.
 * @return {(function(TaskEntity))}
 */
export default function useUpdateTaskData() {
  const queryClient = useQueryClient();

  return useCallback(
    (task) => {
      const updater = (data) =>
        new PagedResultsBuilder(
          data,
          checkTaskFilters,
          makeTaskComparator
        ).addEntity(task).results;
      queryClient.setQueriesData(["tasks"], updater);
      queryClient.setQueryData(["task", task.id], task);
    },
    [queryClient]
  );
}
