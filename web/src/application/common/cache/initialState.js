/**
 * Cache initial state.
 * @type {{items: {}, maxSize: number, history: [string]}}
 */
const initialState = {
  maxSize: 1000,
  /**
   * key => value mapping
   */
  items: {},
  /**
   * List of entity keys representing last operations in chronological order.
   */
  history: [],
};

export default initialState;

/**
 * Get entry from cache if present.
 * @param {{items: {}, maxSize: number, history: [string]}} cache
 * @param {string} key
 * @return {*}
 */
export function getEntry(cache, key) {
  return cache.items[key];
}

/**
 * Check the given key is cached.
 * @param {{items: {}, maxSize: number, history: [string]}} cache
 * @param {string} key
 * @return {boolean}
 */
export function hasEntry(cache, key) {
  return getEntry(cache, key) != null;
}
