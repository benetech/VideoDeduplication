import collInitialState from "../coll/initialState";

/**
 * Initial State for file collection management.
 */
const initialState = {
  /**
   * Files collection initial state.
   */
  coll: collInitialState,
};

export type FilesState = typeof initialState;

export default initialState;
