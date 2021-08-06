import { getEntry } from "../../common/cache/initialState";
import { getQuery } from "../../common/queryCache";

export const selectFileList = (state) => state.files.fileList;

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
export const selectTasks = (state) => state.tasks;

/**
 * Select cached task.
 */
export const selectCachedTask = (id) => (state) =>
  getEntry(state.taskCache, id);

/**
 * Select task logs.
 */
export const selectTaskLogs = (state) => state.taskLogs;

/**
 * Select templates.
 */
export const selectTemplates = (state) => state.templates;

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
