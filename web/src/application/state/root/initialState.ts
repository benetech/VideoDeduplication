import filesInitialState from "../files/root/initialState";

/**
 * Application initial state.
 */
const initialState = {
  /**
   * Files initial state.
   */
  files: filesInitialState,
};

export type AppState = typeof initialState;

export default initialState;
