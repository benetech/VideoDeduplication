/**
 * @typedef {{id}} Entity database entity with id
 */

/**
 * Get set of entity ids.
 * @param {Entity[]} entities
 * @return {Set}
 */
function ids(entities) {
  const result = new Set();
  for (let entity of entities) {
    result.add(entity.id);
  }
  return result;
}

/**
 * Index entities by id.
 * @param {Entity[]} entities array of entities to be indexed
 * @return {Map} mapping id -> entity
 */
function indexEntities(entities) {
  const index = new Map();
  for (let entity of entities) {
    index.set(entity.id, entity);
  }
  return index;
}

/**
 * Add new entities to the entity array.
 * @param {Entity[]} existing Array of existing entities.
 * @param {Entity[]} loaded The new entities that should be added.
 * @returns {Entity[]} The updated mapping.
 */
export default function extendEntityList(existing, loaded) {
  const existingIds = ids(existing);
  const loadedIndex = indexEntities(loaded);
  const newEntities = loaded.filter((item) => !existingIds.has(item.id));
  const updatedEntities = existing.map((entity) => {
    if (loadedIndex.has(entity.id)) {
      return loadedIndex.get(entity.id);
    }
    return entity;
  });
  return [...updatedEntities, ...newEntities];
}
