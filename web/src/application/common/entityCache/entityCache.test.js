import entityCacheReducer, { updateFunc } from "./reducer";
import initialState, { getEntity, hasEntity } from "./initialState";
import { cacheEntity, deleteEntity, updateEntity } from "./actions";

export function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function makeEntity(index) {
  return { key: `some-key-${index || randomId()}` };
}

function makeEntities(count = 10) {
  const entities = [];
  const prefix = randomId();
  for (let i = 0; i < count; i++) {
    entities.push(makeEntity(`${prefix}-${i}`));
  }
  return entities;
}

describe(entityCacheReducer, () => {
  test("Ignores unknown actions", () => {
    const result = entityCacheReducer(initialState, { type: "unknown" });
    expect(result).toEqual(initialState);
  });

  describe("Cache entity action", () => {
    test("Caches new entities", () => {
      const key = "some-key";
      const entity = { property: "some-value" };

      const result = entityCacheReducer(initialState, cacheEntity(key, entity));

      expect(hasEntity(result, key)).toBe(true);
      expect(getEntity(result, key)).toEqual(entity);
    });

    test("Overrides existing entities", () => {
      const key = "some-key";
      const oldOne = { property: "old-value", other: "other-value" };
      const newOne = { property: "new-value" };

      let cache = initialState;
      cache = entityCacheReducer(cache, cacheEntity(key, oldOne));
      cache = entityCacheReducer(cache, cacheEntity(key, newOne));

      expect(hasEntity(cache, key)).toBe(true);
      expect(getEntity(cache, key)).toEqual(newOne);
    });

    test("Evicts extra items", () => {
      const maxSize = 10;
      const oldEntities = makeEntities(maxSize);
      const newEntities = makeEntities(maxSize);

      // Cache max number of items
      let cache = { ...initialState, maxSize };
      for (let entity of oldEntities) {
        cache = entityCacheReducer(cache, cacheEntity(entity.key, entity));
      }

      // Check all items are cached
      for (let entity of oldEntities) {
        expect(hasEntity(cache, entity.key)).toBe(true);
        expect(getEntity(cache, entity.key)).toEqual(entity);
      }

      // Cache extra items and check old ones are evicted one by one
      for (let i = 0; i < newEntities.length; i++) {
        const newOne = newEntities[i];
        const evicted = oldEntities[i];
        cache = entityCacheReducer(cache, cacheEntity(newOne.key, newOne));

        expect(hasEntity(cache, newOne.key)).toBe(true);
        expect(getEntity(cache, newOne.key)).toEqual(newOne);
        expect(hasEntity(cache, evicted.key)).toBe(false);
        for (let j = i + 1; j < oldEntities.length; j++) {
          const oldOne = oldEntities[j];
          expect(hasEntity(cache, oldOne.key)).toBe(true);
          expect(getEntity(cache, oldOne.key)).toEqual(oldOne);
        }
      }

      // Check all new items are cached
      for (let entity of newEntities) {
        expect(hasEntity(cache, entity.key)).toBe(true);
        expect(getEntity(cache, entity.key)).toEqual(entity);
      }

      // Check all old items are evicted
      for (let entity of oldEntities) {
        expect(hasEntity(cache, entity.key)).toBe(false);
        expect(getEntity(cache, entity.key)).toBe(undefined);
      }
    });
  });

  describe("Update entity action", () => {
    test("Updates cached entity", () => {
      const key = "some-key";
      const orig = { foo: { bar: "old" }, baz: "old" };
      const updates = { foo: { bar: "new" } };
      const updated = { foo: { bar: "new" }, baz: "old" };

      let cache = initialState;
      cache = entityCacheReducer(cache, cacheEntity(key, orig));
      cache = entityCacheReducer(cache, updateEntity(key, updates));

      expect(hasEntity(cache, key)).toBe(true);
      expect(getEntity(cache, key)).toEqual(updated);
    });

    test("Ignores missing key updates", () => {
      let cache = initialState;

      const missingKey = "missing-key";
      const updates = { some: "updates" };
      cache = entityCacheReducer(cache, updateEntity(missingKey, updates));

      expect(hasEntity(cache, missingKey)).toBe(false);
      expect(getEntity(cache, missingKey)).toBe(undefined);
    });
  });

  describe("Delete action", () => {
    test("Deletes entities", () => {
      const key = "some-key";
      const entity = { property: "some-value" };

      let cache = initialState;
      cache = entityCacheReducer(cache, cacheEntity(key, entity));
      cache = entityCacheReducer(cache, deleteEntity(key));

      expect(hasEntity(cache, key)).toBe(false);
      expect(getEntity(cache, key)).toEqual(undefined);
    });

    test("Ignores missing keys", () => {
      const key = "some-key";
      const missingKey = "missing-key";
      const entity = { property: "some-value" };

      let initial = entityCacheReducer(initialState, cacheEntity(key, entity));
      let result = entityCacheReducer(initial, deleteEntity(missingKey));

      expect(result).toEqual(initial);
    });
  });
});

describe(updateFunc, () => {
  test("Updates entities", () => {
    const key = "some-key";
    const original = { count: 0, other: "some-value" };
    const increment = (entity) => ({ ...entity, count: entity.count + 1 });

    let cache = initialState;
    cache = entityCacheReducer(cache, cacheEntity(key, original));
    cache = updateFunc(cache, key, increment);
    cache = updateFunc(cache, key, increment);

    expect(hasEntity(cache, key)).toBe(true);
    expect(getEntity(cache, key)).toEqual({
      count: original.count + 2,
      other: original.other,
    });
  });
});
