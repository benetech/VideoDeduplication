import extendEntityList from "../../lib/entity/extendEntityList";
import getEntityId from "../../lib/entity/getEntityId";
import deleteEntityFromList from "../../lib/entity/deleteEntityFromList";
import { Entity } from "../../lib/entity/Entity";
import { ListResults } from "../../server-api/ServerAPI";
import { InfiniteData } from "react-query";
import { ComparatorFactoryFn, FilterCheckerFn } from "./model";

/**
 * Paged query results builder.
 */
export default class PagedResultsBuilder<
  TEntity extends Entity,
  TFilters = unknown,
  TData extends ListResults<TEntity, TFilters> = ListResults<TEntity, TFilters>
> {
  results?: InfiniteData<TData>;
  checkFilters: FilterCheckerFn<TEntity, TData["request"]>;
  makeComparator: ComparatorFactoryFn<TEntity, TData["request"]>;

  constructor(
    pagedQueryResults: InfiniteData<TData> | undefined,
    checkFilters: FilterCheckerFn<TEntity, TData["request"]>,
    makeComparator: ComparatorFactoryFn<TEntity, TData["request"]>
  ) {
    this.results = pagedQueryResults;
    this.checkFilters = checkFilters;
    this.makeComparator = makeComparator;
  }

  /**
   * Check if some data were fetched.
   */
  _hasResults(
    pagedQueryResults: InfiniteData<TData> | undefined
  ): pagedQueryResults is InfiniteData<TData> {
    return (pagedQueryResults?.pages?.length || 0) > 0;
  }

  /**
   * Extract request and total from the last page.
   */
  _unpackResults(pagedQueryResults: InfiniteData<TData>): {
    pages: TData[];
    request: TData["request"];
    total: number;
  } {
    const { pages } = pagedQueryResults;
    const lastPage = pages[pages.length - 1];
    const { request, total } = lastPage;
    return { pages, request, total };
  }

  _spliceItems(pages: TData[]): TEntity[] {
    const items: TEntity[][] = pages.map((page) => page.items);
    return ([] as TEntity[]).concat(...items);
  }

  _makeResults(
    items: TEntity[],
    request: TData["request"],
    total: number,
    lastPage: TData
  ): InfiniteData<TData> {
    if (total === 0) {
      const emptyPage: TData = {
        ...lastPage,
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
    const pages: TData[] = [];
    const pageParams: number[] = [];
    let offset = 0;
    while (offset < items.length) {
      const updatedRequest = { ...request };
      updatedRequest.offset = offset;
      pages.push({
        ...lastPage,
        request: updatedRequest,
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
   */
  _findEntity(pages: TData[], entityId: TEntity["id"]): TEntity | undefined {
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
   */
  addEntity(entity: TEntity): this {
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
    const lastPage = pages[pages.length - 1];
    this.results = this._makeResults(
      updatedItems,
      request,
      updatedTotal,
      lastPage
    );

    return this;
  }

  /**
   * Delete entity from query results.
   * @param entity entity to be deleted.
   */
  deleteEntity(entity: TEntity | TEntity["id"]): this {
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
    const lastPage = pages[pages.length - 1];
    this.results = this._makeResults(
      updatedItems,
      request,
      total - 1,
      lastPage
    );

    return this;
  }

  /**
   * Update entity in the paged query results.
   * @param entity entity or entity id to be updated
   * @param updater function to perform update
   */
  updateEntity(
    entity: TEntity | TEntity["id"],
    updater: (original: TEntity) => TEntity
  ): this {
    // Leave results unchanged if nothing is fetched
    if (!this._hasResults(this.results)) {
      // Do nothing
      return this;
    }

    const { pages, request, total } = this._unpackResults(this.results);
    const entityId = getEntityId(entity);
    const currentEntity = this._findEntity(pages, entityId);

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
    const lastPage = pages[pages.length - 1];
    this.results = this._makeResults(updatedItems, request, total, lastPage);
    return this;
  }
}
