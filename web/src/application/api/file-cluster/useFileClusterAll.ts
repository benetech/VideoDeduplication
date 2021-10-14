import useFileClusterLazy, { ClusterPage } from "./useFileClusterLazy";
import { useBasicLoadAll } from "../../common/useLoadAll";
import { useMemo } from "react";
import { QueryOptions } from "../../common/model";
import { ClusterFilters, FileIndex, VideoFile } from "../../../model/VideoFile";
import { Match } from "../../../model/Match";

export type UseFileClusterAllResults = {
  error: Error | null;
  total: number;
  resumeLoading: () => void;
  hasMore: boolean;
  progress: number;
  done: boolean;
  files: FileIndex;
  matches: Match[];
};

/**
 * Fetch entire file cluster satisfying the query params.
 */
export default function useFileClusterAll(
  fileId: VideoFile["id"],
  filters: ClusterFilters = {},
  options: QueryOptions = {}
): UseFileClusterAllResults {
  const query = useFileClusterLazy(fileId, filters, options);
  const results = useBasicLoadAll<Match, ClusterPage>(query, {
    collectItems: () => [],
  });

  // Collect files
  const files: FileIndex = useMemo(() => {
    const fileIndex: FileIndex = {};
    for (const page of query.pages) {
      for (const file of page.files) {
        fileIndex[file.id] = file;
      }
    }
    return fileIndex;
  }, [query.pages]);

  // Collect matches
  const matches: Match[] = useMemo(
    () => ([] as Match[]).concat(...query.pages.map((page) => page.matches)),
    [query.pages]
  );

  return { ...results, files, matches };
}
