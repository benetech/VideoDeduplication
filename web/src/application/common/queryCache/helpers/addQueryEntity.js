/**
 * Add entity to the query if possible.
 * @param {CachedQuery} query
 * @param {Entity} entity entity to be added
 * @param {function} checkFilters check if the entity satisfies query params
 * @param {function} comparatorFactory produce sort comparator from query params
 * @return {CachedQuery}
 */
import extendEntityList from "../../helpers/extendEntityList";

export default function addQueryEntity(
  query,
  entity,
  checkFilters,
  sortComparator
) {
  // Don't change query if entity doesn't satisfy query params
  if (!checkFilters(query.params, entity)) {
    return query;
  }

  // Produce updated entity list
  const updatedItems = extendEntityList(query.items, [entity]);
  updatedItems.sort(sortComparator);

  // If the new item is actually added (and not replaced) to the end
  // of the existing incomplete query, then we must ignore it,
  // because we may skip some item when the next request is finished.
  const lastItem = updatedItems[updatedItems.length - 1];
  const incomplete = query.items.length < query.total;
  const wasAdded = updatedItems.length > query.items.length;
  if (wasAdded && incomplete && entity === lastItem) {
    return query;
  }

  const updatedQuery = { ...query, items: updatedItems };
  if (wasAdded) {
    query.total += 1;
  }

  return updatedQuery;
}
