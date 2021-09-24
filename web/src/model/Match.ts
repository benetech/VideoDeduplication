import { MatchCategory, VideoFile } from "./VideoFile";

/**
 * File match query filters.
 */
export type MatchQueryFilter = {
  remote?: boolean;
  falsePositive?: boolean;
  sort?: string;
  sortDirection?: string;
};

/**
 * Directed match of the given mother file.
 */
export type FileMatch = {
  id: number;
  motherFile?: VideoFile;
  file: VideoFile;
  distance: number;
  falsePositive: boolean;
};

/**
 * Match between two video files.
 */
export type Match = {
  id: number;
  source: number;
  target: number;
  distance: number;
  falsePositive: boolean;
};

/**
 * Count of matched files by category.
 */
export type MatchCounts = {
  [category in MatchCategory]: number;
};
