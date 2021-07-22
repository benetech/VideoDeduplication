/**
 * Entity cache initial state.
 * @type {{items: {}, maxSize: number, history: [string]}}
 */
const initialState = {
  maxSize: 1000,
  /**
   * key => entity mapping
   */
  items: {},
  /**
   * List of entity keys representing last operations in chronological order.
   */
  history: [],
};

export default initialState;

/**
 * Get entity from cache if present.
 * @param {{items: {}, maxSize: number, history: [string]}} cache
 * @param {string} key
 * @return {*}
 */
export function getEntity(cache, key) {
  return cache.items[key];
}

/**
 * Check the given key is cached.
 * @param {{items: {}, maxSize: number, history: [string]}} cache
 * @param {string} key
 * @return {boolean}
 */
export function hasEntity(cache, key) {
  return getEntity(cache, key) != null;
}
