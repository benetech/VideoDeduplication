import makeFetchEntitiesHook from "../state/fetchEntities/makeFetchEntitiesHook";
import { selectFileMatches } from "../state/selectors";
import {
  fetchFileMatchesSlice,
  updateFileMatchesParams,
} from "../state/fileMatches/actions";
import initialState from "../state/fileMatches/initialState";

const useFetchFileMatches = makeFetchEntitiesHook({
  stateSelector: selectFileMatches,
  defaultParams: initialState.params,
  updateParams: updateFileMatchesParams,
  fetchNextSlice: fetchFileMatchesSlice,
  resourceName: "matches",
});

/**
 * Fetch all file matches satisfying the query params.
 * @param params - The matches query params.
 */
export default function useFileMatches(params) {
  if (params.fileId == null) {
    throw new Error("File id cannot be null.");
  }
  return useFetchFileMatches(params);
}
