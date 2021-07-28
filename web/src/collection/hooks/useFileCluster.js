import { useSelector } from "react-redux";
import { selectFileCluster } from "../../application/state/root/selectors";
import {
  fetchFileClusterSlice,
  updateFileClusterParams,
} from "../../application/state/fileCluster/actions";
import initialState from "../../application/state/fileCluster/initialState";
import makeFetchEntitiesHook from "../../application/state/fetchEntities/makeFetchEntitiesHook";

const useFetchFileCluster = makeFetchEntitiesHook({
  stateSelector: selectFileCluster,
  defaultParams: initialState.params,
  updateParams: updateFileClusterParams,
  fetchNextSlice: fetchFileClusterSlice,
  resourceName: "matches",
});

/**
 * Fetch all file cluster elements satisfying the query params.
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
