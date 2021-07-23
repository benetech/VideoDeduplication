import lodash from "lodash";

/**
 * Update a single entity from the list.
 * @param {{id}[]} entities The existing mapping that should be updated.
 * @param {{id}} updates The new entities that should be added.
 * @returns {{id}[]} The updated mapping.
 */
export default function updateEntityList(entities, updates) {
  return entities.map((entity) => {
    if (entity.id === updates.id) {
      return lodash.merge({}, entity, updates);
    }
    return entity;
  });
}
