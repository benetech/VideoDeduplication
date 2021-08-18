/**
 * Compare objects by start time.
 * @param {ObjectEntity} objectA
 * @param {ObjectEntity} objectB
 * @return {number}
 */
function startTimeComparator(objectA, objectB) {
  return objectA.start - objectB.start;
}

/**
 * Create objects sort comparator from query params.
 * @return {(function(ObjectEntity,ObjectEntity): number)}
 */
export default function makeObjectComparator() {
  return startTimeComparator;
}
