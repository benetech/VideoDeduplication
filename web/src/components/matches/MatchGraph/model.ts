import { VideoFile } from "../../../model/VideoFile";

/**
 * File cluster node data.
 */
export type ClusterNode = {
  id: VideoFile["id"];
  file: VideoFile;
  /** Number of hops from mother file */
  generation?: number;
};

/**
 * File cluster link data.
 */
export type ClusterLink = {
  source: VideoFile["id"];
  target: VideoFile["id"];
  distance: number;
  /** Number of hops from mother file */
  generation?: number;
};

/**
 * Entire cluster data.
 */
export type ClusterData = {
  nodes: ClusterNode[];
  links: ClusterLink[];
};
