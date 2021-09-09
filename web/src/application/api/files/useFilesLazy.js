import { MatchCategory } from "../../../prop-types/MatchCategory";
import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/react-query/useEntitiesLazy";

const defaultCounts = Object.freeze({
  [MatchCategory.all]: 0,
  [MatchCategory.duplicates]: 0,
  [MatchCategory.related]: 0,
  [MatchCategory.unique]: 0,
});

/**
 * @typedef {{
 *   pages: FileEntity[][],
 *   counts: {
 *     all: number,
 *     related: number,
 *     duplicates: number,
 *     unique: number
 *   },
 *   error: object,
 *   isLoading: boolean,
 *   isError: boolean,
 *   hasNextPage: boolean,
 *   fetchNextPage: function,
 *   refetch: function,
 *   canLoad: boolean,
 * }} FileQueryAPI
 */

/**
 * Use lazy files query.
 * @param {FileFilters} filters query filters
 * @param {{
 *   limit: number
 * }} options additional options
 * @return {FileQueryAPI} files query.
 */
export default function useFilesLazy(filters, options = {}) {
  const server = useServer();
  const { limit = 96 } = options;

  const { results, query } = useEntitiesLazy(
    ["files", { filters, limit }],
    ({ pageParam: offset = 0 }) => server.files.list({ filters, limit, offset })
  );

  let counts = defaultCounts;
  if (query.data?.pages?.length > 0) {
    counts = query.data.pages[query.data.pages.length - 1].counts;
  }

  return { ...results, counts };
}
