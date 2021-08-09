import fileCacheInitialState from "../fileCache/initialState";
import collInitialState from "../coll/initialState";
import queriesCacheInitialState from "../../../common/queryCache/initialState";

/**
 * Initial State for file collection management.
 */
const initialState = {
  /**
   * Cached individual files with fully-loaded data.
   */
  cache: fileCacheInitialState,
  /**
   * Cached file queries.
   */
  queries: queriesCacheInitialState,
  /**
   * Files collection initial state.
   */
  coll: collInitialState,
};

export default initialState;
