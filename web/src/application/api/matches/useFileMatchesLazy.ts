import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/useEntitiesLazy";
import { VideoFile } from "../../../model/VideoFile";
import {
  DefaultMatchQueryFilters,
  FileMatch,
  MatchQueryFilters,
} from "../../../model/Match";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import { QueryFileMatchesResults } from "../../../server-api/ServerAPI";

/**
 * Use lazy file matches query.
 */
export default function useFileMatchesLazy(
  fileId: VideoFile["id"],
  filters: MatchQueryFilters = DefaultMatchQueryFilters,
  options: QueryOptions = {}
): LazyQueryResults<FileMatch[]> {
  const server = useServer();
  const { limit = 100, fields = ["meta", "exif", "scenes"] } = options;

  const { results } = useEntitiesLazy<
    FileMatch,
    MatchQueryFilters,
    QueryFileMatchesResults
  >(
    ["files/matches", fileId, { filters, limit, fields }],
    ({ pageParam: offset = 0 }) =>
      server.files.matches({ fileId, filters, limit, offset, fields })
  );

  return results;
}
