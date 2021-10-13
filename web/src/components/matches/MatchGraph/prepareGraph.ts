import { FileIndex, VideoFile } from "../../../model/VideoFile";
import { AdjacencyTable, ClusterData, ClusterLink, ClusterNode } from "./model";
import { Match } from "../../../model/Match";
import getEntityId from "../../../lib/entity/getEntityId";

/**
 * For each node create a data structure expected by the D3Graph
 * and return nodes as an index (node.id => node).
 */
function createNodes(files: FileIndex): ClusterNode[] {
  return Object.values(files).map((file) => ({
    id: file.id,
    file: file,
  }));
}

/**
 * Convert matches to links expected byt the D3Graph class.
 */
function createLinks(matches: Match[]): ClusterLink[] {
  return matches.map((match) => ({
    source: match.source,
    target: match.target,
    distance: match.distance,
  }));
}

/**
 * Calculate adjacency table (node.id => set of adjacent node ids).
 */
export function getAdjacency(
  links: ClusterLink[],
  nodes: ClusterNode[]
): AdjacencyTable {
  const adjacency = new Map<VideoFile["id"], Set<VideoFile["id"]>>();
  for (const node of nodes) {
    adjacency.set(node.id, new Set());
  }
  for (const link of links) {
    adjacency
      .get(getEntityId<ClusterNode>(link.source))
      ?.add(getEntityId<ClusterNode>(link.target));
    adjacency
      .get(getEntityId<ClusterNode>(link.target))
      ?.add(getEntityId<ClusterNode>(link.source));
  }
  return adjacency;
}

/**
 * Calculate node generation for each node, where generation is a length
 * of shortest path from the origin node to the given node.
 *
 * @param origin origin node id
 * @param adjacency mapping: node.id => set of adjacent node ids.
 * @returns {} node generation by id.
 */
function getNodeGenerations(
  origin: VideoFile["id"],
  adjacency: Map<number, Set<number>>
): Map<number, number> {
  const generations = new Map<number, number>();
  generations.set(origin, 0);
  const seen = new Set<number>([origin]);

  let generation = 0;
  let currentGeneration = new Set<number>([origin]);
  let nextGeneration = new Set<number>();
  while (currentGeneration.size > 0) {
    for (const parent of currentGeneration) {
      for (const child of adjacency.get(parent) || []) {
        if (!seen.has(child)) {
          generations.set(child, generation + 1);
          nextGeneration.add(child);
          seen.add(child);
        }
      }
      generation += 1;
      currentGeneration = nextGeneration;
      nextGeneration = new Set();
    }
  }
  return generations;
}

/**
 * Prepare nodes and links as expected by D3Graph class.
 *
 * @param originFile mother file.
 * @param matches list of matches
 * @param files list of related files
 * @returns {{nodes: any[], links: any[]}}
 */
export default function prepareGraph(
  originFile: VideoFile,
  matches: Match[],
  files: FileIndex
): ClusterData {
  const nodes = createNodes(files);
  const links = createLinks(matches);
  const adjacency = getAdjacency(links, nodes);
  const nodeGenerations = getNodeGenerations(originFile.id, adjacency);

  for (const node of nodes.values()) {
    node.generation = nodeGenerations.get(node.id);
  }

  for (const link of links) {
    link.generation = Math.min(
      nodeGenerations.get(getEntityId<ClusterNode>(link.source)) || 0,
      nodeGenerations.get(getEntityId<ClusterNode>(link.target)) || 0
    );
  }

  return { links, nodes };
}
