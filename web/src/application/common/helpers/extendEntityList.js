/**
 * Get set of entity ids.
 */
function ids(entities) {
  const result = new Set();
  for (let entity of entities) {
    result.add(entity.id);
  }
  return result;
}

/**
 * Add new entities to the entity list.
 * @param {Object} existing - The existing mapping that should be updated.
 * @param {[{id: any}]} loaded _ The new entities that should be added.
 * @returns {Object} The updated mapping.
 */
export default function extendEntityList(existing, loaded) {
  const existingIds = ids(existing);
  const newEntities = loaded.filter((item) => !existingIds.has(item.id));
  return [...existing, ...newEntities];
}
