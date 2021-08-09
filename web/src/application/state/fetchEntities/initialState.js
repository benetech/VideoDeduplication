/**
 * Example initial state for loadable
 * entity collection.
 *
 * @type {Object}
 */
// eslint-disable-next-line
const initialState = {
  /**
   * Request params.
   */
  params: {
    /**
     * Whatever request parameters (like
     * filters, fileId, include-fields, etc.)
     * that may affect the actual data that
     * will be fetched.
     *
     * If one of these parameters changes then
     * all the fetched data must be discarded
     * and a new data should be requested according
     * to the new parameters. There must be all
     * such parameters and only them.
     */
  },
  /**
   * Total count of entities that
   * may be fetched with the given
   * parameters. The value must be
   * `undefined` when no data were
   * fetched since the last params
   * change.
   */
  total: undefined,
  /**
   * True iff the previous request
   * finished and was unsuccessful.
   */
  error: false,
  /**
   * True iff the last request
   * is still in progress.
   */
  loading: false,
  /**
   * Maximal number of entities that
   * should be fetched with one request.
   */
  limit: 100,
  /**
   * Fetched entities.
   */
  items: [],
};
