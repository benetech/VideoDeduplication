import cacheInitialState from "../cache/initialState";
import queriesInitialState from "../queries/initialState";

/**
 * Initial State for templates management.
 */
const initialState = {
  /**
   * Cached individual templates.
   */
  cache: cacheInitialState,
  /**
   * Cached template queries.
   */
  queries: queriesInitialState,
};

export default initialState;
