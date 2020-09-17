/**
 * Export entire collection state.
 */
export const selectColl = (state) => state.coll;

export const selectFiles = (state) => selectColl(state).files;

export const selectFilters = (state) => selectColl(state).filters;

export const selectCounts = (state) => selectColl(state).counts;

export const selectLoading = (state) => selectColl(state).loading;

export const selectError = (state) => selectColl(state).error;

/**
 * Select cached file by id.
 */
export const selectCachedFile = (id) => (state) =>
  selectColl(state).fileCache.files[id];

/**
 * Select file matches.
 */
export const selectFileMatches = (state) => selectColl(state).fileMatches;
