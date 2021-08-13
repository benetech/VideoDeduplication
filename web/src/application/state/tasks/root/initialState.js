import cacheInitialState from "../cache/initialState";
import queriesInitialState from "../queries/initialState";

/**
 * Initial State for background task logic.
 */
const initialState = {
  /**
   * Cached individual tasks.
   */
  cache: cacheInitialState,
  /**
   * Cached task queries.
   */
  queries: queriesInitialState,
};

export default initialState;
