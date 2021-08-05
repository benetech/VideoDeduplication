import fileListInitialState from "../fileList/initialState";
import fileCacheInitialState from "../fileCache/initialState";
import collInitialState from "../coll/initialState";

/**
 * Initial State for file collection management.
 */
const initialState = {
  /**
   * Files loaded and displayed on the file browser page ('My Collection').
   */
  fileList: fileListInitialState,
  /**
   * Cached individual files with fully-loaded data.
   */
  cache: fileCacheInitialState,
  /**
   * Files collection initial state.
   */
  coll: collInitialState,
};

export default initialState;
