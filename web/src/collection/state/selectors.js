/**
 * Export entire collection state.
 */
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
  selectColl(state).fileCache.files[id];

/**
 * Select file matches.
 */
export const selectFileMatches = (state) => selectColl(state).fileMatches;

/**
 * Select file cluster.
 */
export const selectFileCluster = (state) => selectColl(state).fileCluster;
