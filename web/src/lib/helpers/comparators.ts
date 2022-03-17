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

export function attrComparator<Type>(attr: keyof Type): ComparatorFn<Type> {
  return (a, b) => {
    if (a[attr] > b[attr]) {
      return 1;
    } else if (b[attr] > a[attr]) {
      return -1;
    } else {
      return 0;
    }
  };
}

export function funcComparator<Type>(
  getter: (value: Type) => number | string
): ComparatorFn<Type> {
  return (a, b) => {
    const valueA = getter(a);
    const valueB = getter(b);
    if (valueA > valueB) {
      return 1;
    } else if (valueB > valueA) {
      return -1;
    } else {
      return 0;
    }
  };
}
