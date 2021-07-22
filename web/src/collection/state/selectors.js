/**
 * Export entire collection state.
 */
import { getEntity } from "../../application/common/entityCache/initialState";

export const selectColl = (state) => state.coll;

export const selectFileList = (state) => selectColl(state).fileList;

export const selectFiles = (state) => selectFileList(state).files;

export const selectFileFilters = (state) => selectFileList(state).filters;

export const selectFileCounts = (state) => selectFileList(state).counts;

export const selectFileLoading = (state) => selectFileList(state).loading;

export const selectFileError = (state) => selectFileList(state).error;

/**
 * Select cached file by id.
 */
export const selectCachedFile = (id) => (state) =>
  getEntity(selectColl(state).fileCache, id);

/**
 * Select file matches.
 */
export const selectFileMatches = (state) => selectColl(state).fileMatches;

/**
 * Select file cluster.
 */
export const selectFileCluster = (state) => selectColl(state).fileCluster;

/**
 * Select background tasks state.
 */
export const selectTasks = (state) => selectColl(state).tasks;

/**
 * Select cached task.
 */
export const selectCachedTask = (id) => (state) =>
  getEntity(selectColl(state).taskCache, id);

/**
 * Select task logs.
 */
export const selectTaskLogs = (state) => selectColl(state).taskLogs;

/**
 * Select templates.
 */
export const selectTemplates = (state) => selectColl(state).templates;

/**
 * Select object cache.
 */
export const selectObjectCache = (state) => selectColl(state).objectCache;

/**
 * Select cached file objects.
 */
export const selectCachedObjects = (fileId) => (state) =>
  selectColl(state).objectCache.objects[fileId];

/**
 * Select loaded presets state.
 */
export const selectPresets = (state) => selectColl(state).presets;

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
export const selectFileExclusionsCache = (state) =>
  selectColl(state).fileExclusions;
