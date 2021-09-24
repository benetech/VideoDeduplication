import { DefaultFilters } from "../../../../model/VideoFile";
import ListType from "../../../../model/ListType";

/**
 * Files main collection initial state.
 *
 * Main collection is a list of files displayed on the "Collection" root page.
 */
const initialState = {
  params: DefaultFilters,
  listType: ListType.grid,
  blur: true,
};

export type CollState = typeof initialState;

export default initialState;
