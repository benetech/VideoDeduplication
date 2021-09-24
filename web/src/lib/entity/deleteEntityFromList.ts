import { Entity } from "./Entity";
import getEntityId from "./getEntityId";

/**
 * Delete entity from the list.
 */
export default function deleteEntityFromList<E extends Entity>(
  entities: E[],
  entity: E | E["id"]
): E[] {
  const deletedId = getEntityId(entity);
  return entities.filter((entity) => entity.id !== deletedId);
}
