/**
 * Initial state of background task cache.
 * @type {{tasks: {}, maxSize: number, history: [number]}}
 */
const initialState = {
  maxSize: 1000,
  tasks: {},
  history: [],
};

export default initialState;
