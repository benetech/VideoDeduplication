/**
 * Initial state of the fetched templates.
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
  templates: [],
};

export default initialState;
