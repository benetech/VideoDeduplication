import cacheInitialState from "../cache/initialState";
import queriesInitialState from "../queries/initialState";
import logsInitialState from "../logs/initialState";

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
  /**
   * Task logs state.
   */
  logs: logsInitialState,
};

export default initialState;
