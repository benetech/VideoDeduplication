export const ACTION_SET_COLL_PARAMS = "filesColl.SET_COLL_PARAMS";

/**
 * Set collection params.
 * @param {FileFilters} params
 * @return {{type: string, params}}
 */
export function setCollParams(params) {
  return { type: ACTION_SET_COLL_PARAMS, params };
}

export const ACTION_UPDATE_COLL_PARAMS = "filesColl.UPDATE_COLL_PARAMS";

/**
 * Update collection params.
 *
 * Parameters will be merged with the existing ones.
 *
 * @param {FileFilters} params
 * @return {{type: string, params: FileFilters}}
 */
export function updateCollParams(params) {
  return { type: ACTION_UPDATE_COLL_PARAMS, params };
}

export const ACTION_SET_COLL_BLUR = "filesColl.SET_COLL_BLUR";

/**
 * Switch blur-all flag.
 * @param {boolean} blur
 * @return {{blur: boolean, type: string}}
 */
export function setCollBlur(blur) {
  return { type: ACTION_SET_COLL_BLUR, blur };
}

export const ACTION_SET_COLL_LIST_TYPE = "filesColl.SET_COLL_LIST_TYPE";

/**
 * Set files collection list type.
 * @param {string} listType
 * @return {{type: string, listType: string}}
 */
export function setCollListType(listType) {
  return { type: ACTION_SET_COLL_LIST_TYPE, listType };
}
