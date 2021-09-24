import useFileMatchesLazy from "./useFileMatchesLazy";
import useLoadAll from "../../common/useLoadAll";
import { EagerQueryAPI, QueryOptions } from "../../common/model";
import { FileMatch, MatchQueryFilter } from "../../../model/Match";
import { VideoFile } from "../../../model/VideoFile";

/**
 * Results of `useFileMatchesAll` hook.
 */
export type UseFileMatchesAllResults = EagerQueryAPI & {
  matches: FileMatch[];
};

/**
 * Fetch all file matches satisfying the query params.
 */
export default function useFileMatchesAll(
  fileId: VideoFile["id"],
  filters: MatchQueryFilter = {},
  options: QueryOptions = {}
): UseFileMatchesAllResults {
  const query = useFileMatchesLazy(fileId, filters, options);
  const results = useLoadAll(query);

  return { ...results, matches: results.items };
}
