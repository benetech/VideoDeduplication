/**
 * Initial state of the fetched matches collection.
 * @type {Object}
 */
const initialState = {
  params: {
    fileId: undefined,
    filters: {
      remote: false,
    },
    fields: ["meta", "exif"],
  },
  total: undefined,
  error: false,
  loading: false,
  limit: 100,
  matches: [],
};

export default initialState;
