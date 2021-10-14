import getEntityId from "../entity/getEntityId";
import { Entity } from "../entity/Entity";

/**
 * String sort comparator.
 */
export function stringComparator(first: string, second: string): number {
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
 */
export function idComparator(
  entityA: Entity | Entity["id"],
  entityB: Entity | Entity["id"]
): number {
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

export type ComparatorFn<T> = (first: T, second: T) => number;
