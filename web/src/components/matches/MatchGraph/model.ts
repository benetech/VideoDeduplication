import { VideoFile } from "../../../model/VideoFile";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

/**
 * File cluster node data.
 */
export interface ClusterNode extends SimulationNodeDatum {
  id: VideoFile["id"];
  file: VideoFile;
  /** Number of hops from mother file */
  generation?: number;
}

/**
 * File cluster link data.
 */
export interface ClusterLink extends SimulationLinkDatum<ClusterNode> {
  source: ClusterNode["id"] | ClusterNode;
  target: ClusterNode["id"] | ClusterNode;
  distance: number;
  /** Number of hops from mother file */
  generation?: number;
}

/**
 * Entire cluster data.
 */
export type ClusterData = {
  nodes: ClusterNode[];
  links: ClusterLink[];
};

/**
 * Element position in graph
 */
export type Position = {
  top: number;
  left: number;
};

/**
 * Cluster node adjacency table.
 */
export type AdjacencyTable = Map<ClusterNode["id"], Set<ClusterNode["id"]>>;
