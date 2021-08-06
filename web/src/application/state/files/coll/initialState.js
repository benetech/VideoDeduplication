import { MatchCategory } from "../fileList/MatchCategory";
import { FileSort } from "../fileList/FileSort";
import FileListType from "../fileList/FileListType";

/**
 * Default files query parameters;
 * @type {FileFilters}
 */
export const defaultFileFilters = {
  query: "",
  extensions: [],
  length: { lower: null, upper: null },
  date: { lower: null, upper: null },
  audio: null,
  matches: MatchCategory.all,
  sort: FileSort.date,
  remote: null,
  templates: [],
};

/**
 * Files main collection initial state.
 *
 * Main collection is a list of files displayed on the "Collection" root page.
 *
 * @typedef {{
 *   params: FileFilters,
 *   listType: string,
 *   blur: boolean,
 * }} CollState
 * @type {CollState}
 */
const initialState = {
  params: defaultFileFilters,
  listType: FileListType.grid,
  blur: true,
};

export default initialState;
