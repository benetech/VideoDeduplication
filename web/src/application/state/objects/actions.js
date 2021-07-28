export const ACTION_CACHE_OBJECTS = "coll.CACHE_OBJECTS";

export function cacheObjects(fileId, objects) {
  return { fileId, objects, type: ACTION_CACHE_OBJECTS };
}

export const ACTION_UPDATE_OBJECT = "coll.UPDATE_OBJECT";

export function updateObject(object) {
  return { type: ACTION_UPDATE_OBJECT, object };
}
