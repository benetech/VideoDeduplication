import getEntityId from "../../../../lib/helpers/getEntityId";
import deleteQueryEntity from "./deleteQueryEntity";
import deleteEntityFromList from "../../helpers/deleteEntityFromList";

/**
 * Update entity in the query.
 * @param {CachedQuery} query
 * @param {Entity|string|number} entity
 * @param {function} updater function that takes current entity and produces the updated one
 * @param {function} checkFilters function to check if the entity satisfies query params
 * @param {function} sortComparator sorting comparator
 * @return {CachedQuery}
 */
export default function updateQueryEntity(
  query,
  entity,
  updater,
  checkFilters,
  sortComparator
) {
  const entityId = getEntityId(entity);
  const currentEntity = query.items.find((entity) => entity.id === entityId);

  // Leave query unchanged if it doesn't contain entity
  if (currentEntity === undefined) {
    return query;
  }

  const updatedEntity = updater(currentEntity);

  // If entity doesn't satisfy query filters any more, it must be deleted
  if (!checkFilters(query.params, updatedEntity)) {
    return deleteQueryEntity(query, entityId);
  }

  // Produce updated entity list
  const updatedItems = [
    updatedEntity,
    ...deleteEntityFromList(query.items, entityId),
  ].sort(sortComparator);

  // If the updated entity becomes the last element in incomplete query
  // we may skip some item in the next request. To prevent that we must
  // throw away the updated entity.
  const lastItem = updatedItems[updatedItems.length - 1];
  const incomplete = query.items.length < query.total;
  if (incomplete && updatedEntity === lastItem) {
    return deleteQueryEntity(query, entityId);
  }

  return {
    ...query,
    items: updatedItems,
  };
}
