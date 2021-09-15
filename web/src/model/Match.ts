import { VideoFile } from "./File";

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
 * File categories by match distances.
 */
export enum MatchCategory {
  all = "all",
  duplicates = "duplicates",
  related = "related",
  unique = "unique",
}
