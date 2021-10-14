import { Entity } from "./Entity";

/**
 * Get set of entity ids.
 */
function ids<E extends Entity>(entities: E[]): Set<E["id"]> {
  const result = new Set<E["id"]>();
  for (const entity of entities) {
    result.add(entity.id);
  }
  return result;
}

/**
 * Index entities by id.
 */
function indexEntities<E extends Entity>(entities: E[]): Map<E["id"], E> {
  const index = new Map<E["id"], E>();
  for (const entity of entities) {
    index.set(entity.id, entity);
  }
  return index;
}

/**
 * Add new entities to the entity array.
 */
export default function extendEntityList<E extends Entity>(
  existing: E[],
  loaded: E[]
): E[] {
  const existingIds = ids(existing);
  const loadedIndex = indexEntities(loaded);
  const newEntities = loaded.filter((item) => !existingIds.has(item.id));
  const updatedEntities = existing.map((entity) => {
    if (loadedIndex.has(entity.id)) {
      return loadedIndex.get(entity.id) as E;
    }
    return entity;
  });
  return [...updatedEntities, ...newEntities];
}
