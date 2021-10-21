import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/useEntitiesLazy";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import { MatchCounts } from "../../../model/Match";
import {
  FileFilters,
  MatchCategory,
  VideoFile,
} from "../../../model/VideoFile";
import { ListFilesResults } from "../../../server-api/ServerAPI";

const defaultCounts: MatchCounts = Object.freeze({
  [MatchCategory.all]: 0,
  [MatchCategory.duplicates]: 0,
  [MatchCategory.related]: 0,
  [MatchCategory.unique]: 0,
});

/**
 * UseFilesLazyAPI
 */
export type UseFilesLazyAPI = LazyQueryResults<VideoFile[]> & {
  counts: MatchCounts;
};

function getTotalFiles(lastPage: ListFilesResults | undefined): number {
  if (lastPage != null) {
    const matchCategory = lastPage.request.filters.matches;
    return lastPage.counts[matchCategory];
  }
  return 0;
}

/**
 * Use lazy files query.
 */
export default function useFilesLazy(
  filters: FileFilters,
  options: QueryOptions = {}
): UseFilesLazyAPI {
  const server = useServer();
  const { limit = 96 } = options;

  const { results, query } = useEntitiesLazy<
    VideoFile,
    FileFilters,
    ListFilesResults
  >(
    ["files", { filters, limit }],
    ({ pageParam: offset = 0 }) =>
      server.files.list({ filters, limit, offset }),
    { getTotal: getTotalFiles }
  );

  let counts = defaultCounts;
  if (query.data != null && (query.data.pages?.length || 0) > 0) {
    counts = query.data.pages[query.data.pages.length - 1].counts;
  }

  return { ...results, counts };
}
