import { getEntry } from "../../common/cache/initialState";
import { getQuery } from "../../common/queryCache";

// File selectors

export const selectCachedFile = (id) => (state) =>
  getEntry(state.files.cache, id);

export const selectFilesColl = (state) => state.files.coll;

export const selectFilesQuery = (params) => (state) =>
  getQuery(state.files.queries, params);

// File match selectors

export const selectFileMatches = (state) => state.fileMatches;

export const selectFileCluster = (state) => state.fileCluster;

// Background task selectors

export const selectTaskQuery = (params) => (state) =>
  getQuery(state.tasks.queries, params);

export const selectCachedTask = (id) => (state) =>
  getEntry(state.tasks.cache, id);

export const selectTaskLogs = (state) => state.tasks.logs;

// Template selectors

export const selectTemplatesQuery = (params) => (state) =>
  getQuery(state.templates.queries, params);

export const selectCachedTemplate = (id) => (state) =>
  getEntry(state.templates.cache, id);

// Template-match (object) selectors.

export const selectObjectsQuery = (params) => (state) =>
  getQuery(state.objects.queries, params);

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
