/**
 * Initial state of the fetched matches collection.
 * @type {Object}
 */
import { MatchSort } from "./MatchSort";
import { MatchSortDirection } from "./MatchSortDirection";

const initialState = {
  params: {
    fileId: undefined,
    filters: {
      remote: true,
      falsePositive: false,
      sort: MatchSort.distance,
      sortDirection: MatchSortDirection.asc,
    },
    fields: ["meta", "exif"],
  },
  total: undefined,
  error: false,
  loading: false,
  limit: 100,
  matches: [],
};

export default initialState;
