/**
 * Initial state of the fetched background tasks.
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
  tasks: [],
};

export default initialState;
