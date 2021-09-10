import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/react-query/useEntitiesLazy";

/**
 * @typedef {{
 *   files: FileMatchEntity[],
 *   matches: MatchEntity[],
 * }} ClusterPage
 *
 * @typedef {{
 *   pages: ClusterPage[],
 *   total: number,
 *   error: object,
 *   isLoading: boolean,
 *   isError: boolean,
 *   hasNextPage: boolean,
 *   fetchNextPage: function,
 *   refetch: function,
 *   canLoad: boolean,
 * }} LazyClusterQueryAPI
 */

/**
 * Use lazy cluster query.
 * @param fileId {number} file id
 * @param {ClusterFilters} filters cluster query filters
 * @param {{
 *   limit: number,
 *   fields: string[],
 * }} options additional options
 * @return {LazyClusterQueryAPI} files query.
 */
export default function useFileClusterLazy(fileId, filters, options = {}) {
  const server = useServer();
  const { limit = 100, fields = ["meta", "exif"] } = options;

  const { results, query } = useEntitiesLazy(
    ["files/cluster", fileId, { filters, limit, fields }],
    ({ pageParam: offset = 0 }) =>
      server.files.cluster({ fileId, filters, limit, offset, fields }),
    {
      makePages: (query) =>
        (query.data?.pages || []).map((page) => ({
          files: page.files,
          matches: page.matches,
        })),
      getOffset: (lastPage) =>
        lastPage.request.offset + lastPage.matches.length,
    }
  );

  return results;
}
