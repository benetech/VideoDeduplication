import lodash from "lodash";

/**
 * Get keys of multiple objects.
 */
function keys<T>(...objects: T[]): Set<keyof T> {
  const result = new Set<string>();
  for (const object of objects) {
    Object.keys(object).forEach(result.add, result);
  }
  return result as Set<keyof T>;
}

export type DiffAttributes<T> = {
  [key in keyof T]: boolean;
};

/**
 * Compare two plain objects, perform deep comparison on each attribute and
 * return a new object where for each attribute there is a comparison result.
 */
export default function objectDiff<T>(
  object: T,
  otherObject: T
): Partial<DiffAttributes<T>> {
  const result: Partial<DiffAttributes<T>> = {};
  for (const key of keys(object, otherObject)) {
    result[key] = !lodash.isEqual(object[key], otherObject[key]);
  }
  return result;
}
