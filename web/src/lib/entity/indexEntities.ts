import { Entity } from "./Entity";

/**
 * Index entities by ids.
 */
export default function indexEntities<E extends Entity>(
  entities: E[]
): Map<E["id"], E> {
  const index = new Map<E["id"], E>();
  for (const entity of entities) {
    index.set(entity.id, entity);
  }
  return index;
}
