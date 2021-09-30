import { useServer } from "../../../server-api/context";
import { useBasicEntitiesLazy } from "../../common/useEntitiesLazy";
import { ClusterFilters, VideoFile } from "../../../model/VideoFile";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import { Match } from "../../../model/Match";
import { QueryClusterResults } from "../../../server-api/ServerAPI";
import { UseInfiniteQueryResult } from "react-query";

export type ClusterPage = {
  files: VideoFile[];
  matches: Match[];
};

/**
 * Use lazy cluster query.
 */
export default function useFileClusterLazy(
  fileId: VideoFile["id"],
  filters: ClusterFilters = {},
  options: QueryOptions = {}
): LazyQueryResults<ClusterPage> {
  const server = useServer();
  const { limit = 100, fields = ["meta", "exif"] } = options;

  const { results } = useBasicEntitiesLazy<ClusterPage, QueryClusterResults>(
    ["files/cluster", fileId, { filters, limit, fields }],
    ({ pageParam: offset = 0 }) =>
      server.files.cluster({ fileId, filters, limit, offset, fields }),
    {
      makePages: (
        query: UseInfiniteQueryResult<QueryClusterResults>
      ): ClusterPage[] =>
        (query.data?.pages || []).map((page) => ({
          files: page.files,
          matches: page.matches,
        })),
      getOffset: (lastPage: QueryClusterResults): number =>
        lastPage.request.offset + lastPage.matches.length,
    }
  );

  return results;
}
