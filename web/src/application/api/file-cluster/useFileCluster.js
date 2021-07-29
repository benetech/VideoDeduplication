import { useSelector } from "react-redux";
import { selectFileCluster } from "../../state/root/selectors";
import {
  fetchFileClusterSlice,
  updateFileClusterParams,
} from "../../state/fileCluster/actions";
import initialState from "../../state/fileCluster/initialState";
import makeFetchEntitiesHook from "../../state/fetchEntities/makeFetchEntitiesHook";

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
