/**
 * Initial state of cache of fully-fetched individual files.
 * @type {{files: {}, maxSize: number, history: [number]}}
 */
const initialState = {
  maxSize: 1000,
  files: {},
  history: [],
};

export default initialState;
