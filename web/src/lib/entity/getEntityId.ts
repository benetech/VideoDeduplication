import { Entity, isEntity, isEntityId } from "./Entity";

/**
 * Get entity id.
 *
 * This is a utility function to build more convenient API accepting Entity or
 * Entity["id"] when the only required value is id.
 */
export default function getEntityId<E extends Entity>(
  value: E | E["id"]
): E["id"] {
  if (isEntityId(value)) {
    return value;
  } else if (isEntity(value)) {
    return value.id;
  } else {
    throw new Error(`Invalid entity identifier: ${JSON.stringify(value)}`);
  }
}
