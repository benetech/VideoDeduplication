export const ACTION_CACHE_OBJECTS = "coll.CACHE_OBJECTS";

export function cacheObjects(fileId, objects) {
  return { fileId, objects, type: ACTION_CACHE_OBJECTS };
}
