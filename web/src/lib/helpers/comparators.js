import getEntityId from "./getEntityId";

/**
 * String sort comparator.
 *
 * @param {string} first
 * @param {string} second
 * @return {number}
 */
export function stringComparator(first, second) {
  if (first > second) {
    return 1;
  } else if (first < second) {
    return -1;
  } else {
    return 0;
  }
}

/**
 * Compare two entities by ids.
 * @param {Entity} entityA
 * @param {Entity} entityB
 * @return {number}
 */
export function idComparator(entityA, entityB) {
  const a = getEntityId(entityA);
  const b = getEntityId(entityB);
  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  } else {
    return 0;
  }
}
