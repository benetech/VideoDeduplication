/**
 * "Add file to cache" action type.
 */
export const ACTION_CACHE_FILE = "coll.CACHE_FILE";

/**
 * @typedef CacheFileAction
 * @type Object
 * @property {string} type - action type.
 * @property {{id: any}} file - the file that should be cached.
 */

/**
 * Create "Add file to cache" action.
 * @param {{id: any}} file - The file that should be cached.
 * @return {CacheFileAction} A new action instance.
 */
export function cacheFile(file) {
  return { file, type: ACTION_CACHE_FILE };
}
