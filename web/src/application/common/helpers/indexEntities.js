/**
 * Index entities by ids.
 * @param {Entity[]} entities
 * @return {Map<(string|number), Entity>}
 */
export default function indexEntities(entities) {
  const index = new Map();
  for (const entity of entities) {
    index.set(entity.id, entity);
  }
  return index;
}
