import lodash from "lodash";

/**
 * Get keys of multiple objects.
 */
function keys(...objects: Object[]): Set<string> {
  const result = new Set<string>();
  for (const object of objects) {
    Object.keys(object).forEach(result.add, result);
  }
  return result;
}

/**
 * Compare two plain objects, perform deep comparison on each attribute and
 * return a new object where for each attribute there is a comparison result.
 */
export default function objectDiff(
  object: Object,
  otherObject: Object
): Object {
  const result = {};
  for (const key of keys(object, otherObject)) {
    result[key] = !lodash.isEqual(object[key], otherObject[key]);
  }
  return result;
}
