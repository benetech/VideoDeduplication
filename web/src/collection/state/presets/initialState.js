/**
 * Initial state of the fetched presets.
 * @type {Object}
 */
const initialState = {
  params: {
    filters: {},
  },
  total: undefined,
  error: false,
  loading: false,
  limit: 1000,
  presets: [],
};

export default initialState;
