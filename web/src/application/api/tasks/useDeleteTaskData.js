import { useQueryClient } from "react-query";
import { useCallback } from "react";
import PagedResultsBuilder from "../../common/react-query/PagedResultsBuilder";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";

/**
 * Get a callback to delete task data.
 * This function will only delete task data on client.
 * @return {(function(TaskEntity|number))}
 */
export default function useDeleteTaskData() {
  const queryClient = useQueryClient();

  return useCallback(
    (task) => {
      const updater = (data) =>
        new PagedResultsBuilder(
          data,
          checkTaskFilters,
          makeTaskComparator
        ).deleteEntity(task).results;
      queryClient.setQueriesData(["tasks"], updater);
      queryClient.invalidateQueries(["task", task.id]).catch(console.error);
    },
    [queryClient]
  );
}
