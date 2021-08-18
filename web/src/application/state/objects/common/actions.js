export const ACTION_UPDATE_OBJECT = "objects.UPDATE_OBJECT";

/**
 * @typedef {{
 *   type: string,
 *   object: ObjectEntity
 * }} ObjectAction
 */

/**
 * Update single object
 * @param {ObjectEntity} object
 * @return {ObjectAction}
 */
export function updateObject(object) {
  return { type: ACTION_UPDATE_OBJECT, object };
}
