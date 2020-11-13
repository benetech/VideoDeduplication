import { useSelector } from "react-redux";
import { selectFileCluster } from "../selectors";
import { fetchFileClusterSlice, updateFileClusterParams } from "./actions";
import initialState from "./initialState";
import makeFetchEntitiesHook from "../fetchEntities/makeFetchEntitiesHook";

const useFetchFileCluster = makeFetchEntitiesHook({
  stateSelector: selectFileCluster,
  defaultParams: initialState.params,
  updateParams: updateFileClusterParams,
  fetchNextSlice: fetchFileClusterSlice,
  resourceName: "matches",
});

/**
 * Fetch all file cluster elements satisfying the query .
 * @param params - The cluster query params.
 */
export default function useFileCluster(params) {
  if (params.fileId == null) {
    throw new Error("File id cannot be null.");
  }

  const state = useSelector(selectFileCluster);

  return {
    ...useFetchFileCluster(params),
    files: state.files,
  };
}
