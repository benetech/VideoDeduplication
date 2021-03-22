import { MatchCategory } from "./MatchCategory";
import { FileSort } from "./FileSort";
import FileListType from "./FileListType";

const initialState = {
  neverLoaded: true,
  error: false,
  loading: false,
  files: [],
  filters: {
    query: "",
    extensions: [],
    length: { lower: null, upper: null },
    date: { lower: null, upper: null },
    audio: null,
    exif: null,
    matches: MatchCategory.all,
    sort: FileSort.date,
    remote: null,
    templates: [],
  },
  fileListType: FileListType.grid,
  blur: true,
  limit: 20,
  counts: {
    all: 0,
    related: 0,
    duplicates: 0,
    unique: 0,
  },
};

/**
 * Default file list filters.
 */
export const defaultFilters = initialState.filters;

export default initialState;
