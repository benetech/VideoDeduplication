import { MatchCategory, VideoFile } from "./VideoFile";

/**
 * File match query filters.
 */
export type MatchQueryFilters = {
  remote: boolean | null;
  falsePositive: boolean | null;
  sort: string | null;
  sortDirection: string | null;
};

/**
 * Default match filters.
 */
export const DefaultMatchQueryFilters: MatchQueryFilters = {
  remote: null,
  falsePositive: null,
  sort: null,
  sortDirection: null,
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
