import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/react-query/useEntitiesLazy";

/**
 * @typedef {{
 *   pages: FileMatchEntity[][],
 *   total: number,
 *   error: object,
 *   isLoading: boolean,
 *   isError: boolean,
 *   hasNextPage: boolean,
 *   fetchNextPage: function,
 *   refetch: function,
 *   canLoad: boolean,
 * }} FileMatchesQueryAPI
 */

/**
 * Use lazy file matches query.
 * @param fileId {number} file id
 * @param {FileMatchFilters} filters query filters
 * @param {{
 *   limit: number,
 *   fields: string[],
 * }} options additional options
 * @return {FileMatchesQueryAPI} files query.
 */
export default function useFileMatchesLazy(fileId, filters, options = {}) {
  const server = useServer();
  const { limit = 100, fields = ["meta", "exif", "scenes"] } = options;

  const { results } = useEntitiesLazy(
    ["files/matches", fileId, { filters, limit, fields }],
    ({ pageParam: offset = 0 }) =>
      server.files.matches({ fileId, filters, limit, offset, fields })
  );

  return results;
}
