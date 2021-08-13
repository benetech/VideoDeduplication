import sleep from "sleep-promise";
import queryCacheReducer from "./reducer";
import initialState, { getQuery, hasQuery } from "./initialState";
import { queryItems, releaseQuery, updateQuery, useQuery } from "./actions";

export function randomString() {
  return Math.random().toString(36).substring(2, 10);
}

function someParams({ value, nested } = {}) {
  return {
    nested: { value: nested || randomString() },
    value: value || randomString(),
  };
}

function someUpdate(params, { itemsCount = 2, startId = 0, total = 100 } = {}) {
  const items = [];
  for (let i = 0; i < itemsCount; i++) {
    items.push({ id: startId + i, foo: randomString() });
  }

  const data = { value: randomString() };
  return updateQuery({
    params,
    items,
    total: Math.max(itemsCount, total),
    data,
  });
}

describe("Query Cache", () => {
  describe("Use query action", () => {
    test("Creates new query if missing", () => {
      const params = someParams();

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));

      const query = getQuery(cache, params);
      expect(hasQuery(cache, params)).toBe(true);
      expect(query.items).toEqual([]);
      expect(query.total).toBeUndefined();
      expect(query.validUntil).toBeUndefined();
      expect(query.references).toEqual(1);
    });

    test("Updates existing query", () => {
      const params = someParams();

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));
      cache = queryCacheReducer(cache, useQuery(params));

      const query = getQuery(cache, params);
      expect(hasQuery(cache, params)).toBe(true);
      expect(query.references).toEqual(2);
    });

    test("Leaves extra attributes unchanged", () => {
      const params = someParams();
      const updates = someUpdate(params);

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));
      cache = queryCacheReducer(cache, updates);
      cache = queryCacheReducer(cache, useQuery(params));

      const query = getQuery(cache, params);
      expect(query.references).toEqual(2);
      expect(query.total).toEqual(updates.total);
      expect(query.items).toEqual(updates.items);
      expect(query.data).toEqual(updates.data);
      expect(query.validUntil).toBeUndefined();
    });

    test("Resets validUntil attribute", () => {
      const params = someParams();

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));
      cache = queryCacheReducer(cache, releaseQuery(params));
      cache = queryCacheReducer(cache, useQuery(params));

      const query = getQuery(cache, params);
      expect(query.validUntil).toBeUndefined();
    });

    test("Evicts queries exceeding maxQuery number", () => {
      const oldOrphan = someParams({ value: "old" });
      const newOrphan = someParams({ value: "new" });
      const remain = someParams({ value: "newest" });

      let cache = { ...initialState, maxQueries: 2 };
      cache = queryCacheReducer(cache, useQuery(oldOrphan));
      cache = queryCacheReducer(cache, useQuery(newOrphan));

      // Release order must not affect history order:
      // even though we release the oldOrphan more recently,
      // it is the oldOrphan that must be evicted, not the newOrphan
      cache = queryCacheReducer(cache, releaseQuery(newOrphan));
      cache = queryCacheReducer(cache, releaseQuery(oldOrphan));

      // If max cache size is not exceeded orphans must not be evicted
      expect(hasQuery(cache, oldOrphan)).toBe(true);
      expect(hasQuery(cache, newOrphan)).toBe(true);

      cache = queryCacheReducer(cache, useQuery(remain));

      expect(hasQuery(cache, oldOrphan)).toBe(false);
      expect(hasQuery(cache, newOrphan)).toBe(true);
      expect(hasQuery(cache, remain)).toBe(true);
    });

    test("Evicts queries exceeding their ttl", (done) => {
      const orphan = someParams();
      const remain = someParams();

      let cache = { ...initialState, ttl: 10 };
      cache = queryCacheReducer(cache, useQuery(orphan));
      cache = queryCacheReducer(cache, releaseQuery(orphan));
      expect(hasQuery(cache, orphan)).toBe(true);

      sleep(cache.ttl + 1).then(() => {
        try {
          cache = queryCacheReducer(cache, useQuery(remain));
          expect(hasQuery(cache, orphan)).toBe(false);
          expect(hasQuery(cache, remain)).toBe(true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe("Release query action", () => {
    test("Decrements reference counter and sets due", () => {
      const params = someParams();

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));

      const before = getQuery(cache, params);
      cache = queryCacheReducer(cache, releaseQuery(params));
      const after = getQuery(cache, params);

      expect(after.references).toEqual(before.references - 1);
      expect(after.validUntil).toBeGreaterThan(Date.now());
      expect(after.validUntil).toBeLessThanOrEqual(Date.now() + cache.ttl);
    });

    test("Leaves query data unchanged", () => {
      const params = someParams();
      const updates = someUpdate(params, {
        itemsCount: initialState.truncateSize - 1,
      });

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));
      cache = queryCacheReducer(cache, updates);
      cache = queryCacheReducer(cache, releaseQuery(params));
      const query = getQuery(cache, params);

      expect(query.items).toEqual(updates.items);
      expect(query.total).toEqual(updates.total);
      expect(query.data).toEqual(updates.data);
    });

    test("Truncates orphan's data", () => {
      const params = someParams();
      const updates = someUpdate(params, {
        itemsCount: initialState.truncateSize + 1,
      });

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));
      cache = queryCacheReducer(cache, updates);
      cache = queryCacheReducer(cache, releaseQuery(params));
      const query = getQuery(cache, params);

      expect(query.items).not.toEqual(updates.items);
      expect(query.items).toEqual(updates.items.slice(0, cache.truncateSize));
    });

    test("Evicts extra orphans", () => {
      const orphan = someParams();
      const remain = someParams();

      let cache = { ...initialState, maxQueries: 1 };
      cache = queryCacheReducer(cache, useQuery(remain));
      cache = queryCacheReducer(cache, useQuery(orphan));

      expect(hasQuery(cache, orphan)).toBe(true);
      expect(hasQuery(cache, remain)).toBe(true);

      // Evicts more recently used orphan but leaves less-recently used non-orphan
      cache = queryCacheReducer(cache, releaseQuery(orphan));

      expect(hasQuery(cache, orphan)).toBe(false);
      expect(hasQuery(cache, remain)).toBe(true);
    });

    test("Immediately evicts outdated orphaned query", () => {
      const orphan = someParams();
      const remain = someParams();

      let cache = { ...initialState, ttl: -1 };
      cache = queryCacheReducer(cache, useQuery(remain));
      cache = queryCacheReducer(cache, useQuery(orphan));
      cache = queryCacheReducer(cache, releaseQuery(orphan));

      expect(hasQuery(cache, orphan)).toBe(false);
      expect(hasQuery(cache, remain)).toBe(true);
    });

    test("Evicts orphans exceeding their life-span", (done) => {
      const oldOrphan = someParams();
      const newOrphan = someParams();
      const nonOrphan = someParams();

      let cache = { ...initialState, ttl: 10 };
      cache = queryCacheReducer(cache, useQuery(nonOrphan));
      cache = queryCacheReducer(cache, useQuery(newOrphan));
      cache = queryCacheReducer(cache, useQuery(oldOrphan));
      cache = queryCacheReducer(cache, releaseQuery(oldOrphan));

      expect(hasQuery(cache, nonOrphan)).toBe(true);
      expect(hasQuery(cache, oldOrphan)).toBe(true);
      expect(hasQuery(cache, newOrphan)).toBe(true);

      sleep(cache.ttl + 1).then(() => {
        try {
          cache = queryCacheReducer(cache, releaseQuery(newOrphan));
          expect(hasQuery(cache, oldOrphan)).toBe(false);
          expect(hasQuery(cache, newOrphan)).toBe(true);
          expect(hasQuery(cache, nonOrphan)).toBe(true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe("Update query action", () => {
    test("Updates query data, items and total", () => {
      const params = someParams();
      const updates = someUpdate(params);

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));
      cache = queryCacheReducer(cache, updates);

      const query = getQuery(cache, params);
      expect(query.items).toEqual(updates.items);
      expect(query.total).toEqual(updates.total);
      expect(query.data).toEqual(updates.data);
    });

    test("Overrides query data, total but extends items", () => {
      const params = someParams();
      const leastRecent = someUpdate(params);
      const mostRecent = someUpdate(params, {
        startId: leastRecent.items.length,
        total: leastRecent.total + 1,
      });

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));
      cache = queryCacheReducer(cache, leastRecent);
      cache = queryCacheReducer(cache, mostRecent);

      const query = getQuery(cache, params);
      expect(query.items).toEqual(leastRecent.items.concat(mostRecent.items));
      expect(query.total).toEqual(mostRecent.total);
      expect(query.data).toEqual(mostRecent.data);
      expect(query.total).not.toEqual(leastRecent.total);
      expect(query.data).not.toEqual(leastRecent.data);
    });

    test("Replaces the same entities", () => {
      const params = someParams();
      const leastRecent = someUpdate(params);
      const mostRecent = someUpdate(params);

      let cache = initialState;
      cache = queryCacheReducer(cache, useQuery(params));
      cache = queryCacheReducer(cache, leastRecent);
      cache = queryCacheReducer(cache, mostRecent);

      const query = getQuery(cache, params);
      expect(query.items).toEqual(mostRecent.items);
      expect(query.items).not.toEqual(leastRecent.items);
    });

    test("Moves query in front of history", () => {
      const leastRecentlyUpdated = someParams();
      const mostRecentlyUpdated = someParams();

      let cache = { ...initialState, maxQueries: 2 };
      // Create queries in reverse order (will be overridden by updates)
      cache = queryCacheReducer(cache, useQuery(mostRecentlyUpdated));
      cache = queryCacheReducer(cache, useQuery(leastRecentlyUpdated));

      // Update queries in direct order (will override history order)
      cache = queryCacheReducer(cache, someUpdate(leastRecentlyUpdated));
      cache = queryCacheReducer(cache, someUpdate(mostRecentlyUpdated));

      // Release queries in reverse order (will not affect history order)
      cache = queryCacheReducer(cache, releaseQuery(mostRecentlyUpdated));
      cache = queryCacheReducer(cache, releaseQuery(leastRecentlyUpdated));

      // Push extra query to evict the least-recently used one
      cache = queryCacheReducer(cache, useQuery(someParams()));

      expect(hasQuery(cache, leastRecentlyUpdated)).toBe(false);
      expect(hasQuery(cache, mostRecentlyUpdated)).toBe(true);
    });
  });

  describe("Request handling", () => {
    test("New request creates query if missing", () => {
      const params = someParams();
      const action = queryItems(params);

      let cache = initialState;
      cache = queryCacheReducer(cache, action);

      const query = getQuery(cache, params);
      expect(hasQuery(cache, params)).toBe(true);
      expect(query.params).toEqual(params);
      expect(query.items).toEqual([]);
      expect(query.total).toBeUndefined();
      expect(query.validUntil).toBeGreaterThan(Date.now());
      expect(query.references).toEqual(0);
      expect(query.request).toEqual(action.request);
    });
  });
});
