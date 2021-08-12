import getEntityId from "../../../lib/helpers/getEntityId";

/**
 * Delete entity from the list.
 * @param {Entity[]} entities
 * @param {Entity|number|string} entity
 * @return {Entity[]}
 */
export default function deleteEntityFromList(entities, entity) {
  const deletedId = getEntityId(entity);
  return entities.filter((entity) => entity.id !== deletedId);
}
