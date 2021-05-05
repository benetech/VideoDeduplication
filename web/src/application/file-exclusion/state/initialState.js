/**
 * Initial state of file exclusion cache (excluded templates per file).
 * @type {{exclusions: {}, maxSize: number, history: [number]}}
 */
const initialState = {
  maxSize: 1000,
  exclusions: {},
  history: [],
};

export default initialState;
