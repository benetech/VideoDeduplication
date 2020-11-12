/**
 * Initial state of the fetched cluster items.
 * @type {Object}
 */
const initialState = {
  filters: {
    fileId: undefined,
    hops: 2,
    minDistance: 0.0,
    maxDistance: 1.0,
    fields: ["meta", "exif"],
  },
  total: undefined,
  error: false,
  loading: false,
  limit: 100,
  matches: [],
  files: {},
};

export default initialState;
