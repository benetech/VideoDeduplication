import useFileMatchesLazy from "./useFileMatchesLazy";
import useLoadAll from "../../common/useLoadAll";
import { EagerQueryAPI, QueryOptions } from "../../common/model";
import {
  DefaultMatchQueryFilters,
  FileMatch,
  MatchQueryFilters,
} from "../../../model/Match";
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
  filters: MatchQueryFilters = DefaultMatchQueryFilters,
  options: QueryOptions = {}
): UseFileMatchesAllResults {
  const query = useFileMatchesLazy(fileId, filters, options);
  const results = useLoadAll(query);

  return { ...results, matches: results.items };
}
