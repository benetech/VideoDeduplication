import lodash from "lodash";

/**
 * Update a single entity from the list.
 * @param {Entity[]} entities The existing mapping that should be updated.
 * @param {Entity} updates The new entities that should be added.
 * @returns {Entity[]} The updated mapping.
 */
export default function updateEntityList(entities, updates) {
  return entities.map((entity) => {
    if (entity.id === updates.id) {
      return lodash.merge({}, entity, updates);
    }
    return entity;
  });
}
