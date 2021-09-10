import extendEntityList from "../helpers/extendEntityList";
import getEntityId from "../../../lib/helpers/getEntityId";
import deleteEntityFromList from "../helpers/deleteEntityFromList";

/**
 * @typedef {{
 *   offset: number|undefined,
 * }} PageParam
 *
 * @typedef {{
 *   pages: QueryResults[],
 *   pageParams: PageParam[],
 * }} PagedQueryResults
 */

/**
 * Paged query results builder.
 */
export default class PagedResultsBuilder {
  constructor(pagedQueryResults, checkFilters, makeComparator) {
    this.results = pagedQueryResults;
    this.checkFilters = checkFilters;
    this.makeComparator = makeComparator;
  }

  /**
   * Check if some data were fetched.
   * @param {PagedQueryResults} pagedQueryResults
   * @return {boolean}
   */
  _hasResults(pagedQueryResults) {
    return pagedQueryResults?.pages?.length > 0;
  }

  /**
   * Extract request and total from the last page.
   * @param {PagedQueryResults} pagedQueryResults
   */
  _unpackResults(pagedQueryResults) {
    const { pages } = pagedQueryResults;
    const lastPage = pages[pages.length - 1];
    const { request, total } = lastPage;
    return { pages, request, total };
  }

  _spliceItems(pages) {
    return [].concat(...pages.map((page) => page.items));
  }

  _makeResults(items, request, total) {
    if (total === 0) {
      const emptyPage = {
        request: {
          ...request,
          offset: 0,
        },
        items: [],
        total,
      };
      return { pages: [emptyPage], pageParams: [0] };
    }

    const limit = request.limit;
    const pages = [];
    const pageParams = [];
    let offset = 0;
    while (offset < items.length) {
      pages.push({
        request: {
          ...request,
          offset,
        },
        items: items.slice(offset, offset + limit),
        total,
      });
      pageParams.push(offset);
      offset += limit;
    }
    return { pages, pageParams };
  }

  /**
   * Find entity in pages.
   * @param {QueryResults[]} pages
   * @param {number} entityId
   * @private
   * @return {Entity|undefined}
   */
  _findEntity(pages, entityId) {
    for (const page of pages) {
      for (const item of page.items) {
        if (item.id === entityId) {
          return item;
        }
      }
    }
  }

  /**
   * Add item to page query results.
   * @param {Entity} entity
   * @returns {PagedResultsBuilder}
   */
  addEntity(entity) {
    // Leave results unchanged if nothing is fetched
    if (!this._hasResults(this.results)) {
      // Do nothing
      return this;
    }

    const { pages, request, total } = this._unpackResults(this.results);

    // Don't change pages if entity doesn't satisfy query filters
    if (!this.checkFilters(request, entity)) {
      // Do nothing
      return this;
    }

    // Produce updated entity list
    const originalItems = this._spliceItems(pages);
    const updatedItems = extendEntityList(originalItems, [entity]);
    const sortComparator = this.makeComparator(request);
    updatedItems.sort(sortComparator);

    // If the new item is actually added (and not replaced) to the end
    // of the existing incomplete query, then we must ignore it,
    // because we may skip some item when the next request is finished.
    const lastItem = updatedItems[updatedItems.length - 1];
    const incomplete = originalItems.length < total;
    const wasAdded = updatedItems.length > originalItems.length;
    if (wasAdded && incomplete && entity === lastItem) {
      // Do nothing
      return this;
    }

    // Update query results
    const updatedTotal = wasAdded ? total + 1 : total;
    this.results = this._makeResults(updatedItems, request, updatedTotal);

    return this;
  }

  /**
   * Delete entity from query results.
   * @param {Entity|number} entity entity to be deleted.
   */
  deleteEntity(entity) {
    // Leave results unchanged if nothing is fetched
    if (!this._hasResults(this.results)) {
      // Do nothing
      return this;
    }

    const { pages, request, total } = this._unpackResults(this.results);
    const deletedId = getEntityId(entity);

    // Skip if entity is not present in query results
    const containsDeleted = this._findEntity(pages, deletedId) != null;
    if (!containsDeleted) {
      return this;
    }

    // Update query results
    const originalItems = this._spliceItems(pages);
    const updatedItems = deleteEntityFromList(originalItems, deletedId);
    this.results = this._makeResults(updatedItems, request, total - 1);

    return this;
  }

  /**
   * Update entity in the paged query results.
   * @param {Entity|number} entity entity or entity id to be updated
   * @param {function(Entity): Entity} updater function to perform update
   */
  updateEntity(entity, updater) {
    // Leave results unchanged if nothing is fetched
    if (!this._hasResults(this.results)) {
      // Do nothing
      return this;
    }

    const { pages, request, total } = this._unpackResults(this.results);
    const entityId = getEntityId(entity);
    let currentEntity = this._findEntity(pages, entityId);

    // Leave query unchanged if it doesn't contain entity
    if (currentEntity === undefined) {
      return this;
    }

    const updatedEntity = updater(currentEntity);

    // If entity doesn't satisfy query filters any more, it must be deleted
    if (!this.checkFilters(request, updatedEntity)) {
      return this.deleteEntity(entity);
    }

    // Produce updated entity list
    const sortComparator = this.makeComparator(request);
    const originalItems = this._spliceItems(pages);
    const updatedItems = [
      updatedEntity,
      ...deleteEntityFromList(originalItems, entityId),
    ].sort(sortComparator);

    // If the updated entity becomes the last element in incomplete query
    // we may skip some item in the next request. To prevent that we must
    // throw away the updated entity.
    const lastItem = updatedItems[updatedItems.length - 1];
    const incomplete = originalItems.length < total;
    if (incomplete && updatedEntity === lastItem) {
      updatedItems.pop();
    }

    // Update paged query results
    this.results = this._makeResults(updatedItems, request, total);
    return this;
  }
}
