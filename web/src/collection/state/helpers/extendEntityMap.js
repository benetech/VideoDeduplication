/**
 * Add new entities to the `id=>entity` mapping object.
 * @param {Object} existing - The existing mapping that should be updated.
 * @param {[{id: any}]} loaded _ The new entities that should be added.
 * @returns {Object} The updated mapping.
 */
export default function extendEntityMap(existing, loaded) {
  const result = { ...existing };
  loaded.forEach((entity) => (result[entity.id] = entity));
  return result;
}
