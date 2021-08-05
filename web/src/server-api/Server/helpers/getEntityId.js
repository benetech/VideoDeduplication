import lodash from "lodash";

/**
 * Get entity id from id-or-object value.
 * @typedef {number|string|{id:number|string}} EntityIdentifier
 * @param {EntityIdentifier} value entity identifier
 * @return {number|string} entity id
 */
export default function getEntityId(value) {
  if (lodash.isFinite(value) || lodash.isString(value)) {
    return value;
  } else if (lodash.isFinite(value?.id) || lodash.isString(value?.id)) {
    return value.id;
  } else {
    const error = new Error(`Invalid entity identifier: ${value}`);
    error.value = value;
    throw error;
  }
}
