import { getEntry } from "../../common/cache/initialState";
import { getQuery } from "../../common/queryCache";

export const selectFilesColl = (state) => state.files.coll;

export const selectFilesQuery = (params) => (state) =>
  getQuery(state.files.queries, params);

/**
 * Select cached file by id.
 */
export const selectCachedFile = (id) => (state) =>
  getEntry(state.files.cache, id);

/**
 * Select file matches.
 */
export const selectFileMatches = (state) => state.fileMatches;

/**
 * Select file cluster.
 */
export const selectFileCluster = (state) => state.fileCluster;

/**
 * Select background tasks state.
 */
export const selectTaskQuery = (params) => (state) =>
  getQuery(state.tasks.queries, params);
export const selectCachedTask = (id) => (state) =>
  getEntry(state.tasks.cache, id);
export const selectTaskLogs = (state) => state.tasks.logs;

/**
 * Select templates.
 */
export const selectTemplatesQuery = (params) => (state) =>
  getQuery(state.templates.queries, params);

export const selectCachedTemplate = (id) => (state) =>
  getEntry(state.templates.cache, id);
/**
 * Select object cache.
 */
export const selectObjectCache = (state) => state.objectCache;

/**
 * Select cached file objects.
 */
export const selectCachedObjects = (fileId) => (state) =>
  state.objectCache.objects[fileId];

/**
 * Select loaded presets state.
 */
export const selectPresets = (state) => state.presets;

/**
 * Select preloaded preset if any.
 */
export const selectPreset =
  ({ id }) =>
  (state) =>
    selectPresets(state).presets.find((preset) => preset.id === id);

/**
 * Select file exclusions cache.
 */
export const selectFileExclusionsCache = (state) => state.fileExclusions;
