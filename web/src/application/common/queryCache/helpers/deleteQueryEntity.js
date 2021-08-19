import getEntityId from "../../../../lib/helpers/getEntityId";
import deleteEntityFromList from "../../helpers/deleteEntityFromList";

/**
 * Delete entity from the query.
 * @param {CachedQuery} query
 * @param {Entity|string|number} entity
 * @return {CachedQuery}
 */
export default function deleteQueryEntity(query, entity) {
  const deletedId = getEntityId(entity);

  // Don't change query if it doesn't contain the entity.
  if (!query.items.some((element) => element.id === deletedId)) {
    return query;
  }

  return {
    ...query,
    items: deleteEntityFromList(query.items, deletedId),
    total: query.total - 1,

    // Cancel active request to ensure consistency
    request: null,
    requestError: false,
  };
}
