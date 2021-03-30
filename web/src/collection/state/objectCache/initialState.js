/**
 * Initial state of file objects cache.
 * @type {{objects: {}, maxSize: number, history: [number]}}
 */
const initialState = {
  maxSize: 1000,
  objects: {},
  history: [],
};

export default initialState;
