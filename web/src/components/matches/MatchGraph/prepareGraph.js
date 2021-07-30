/**
 * For each node create a data structure expected by the D3Graph
 * and return nodes as an index (node.id => node).
 */
function createNodes(files) {
  return Object.values(files).map((file) => ({
    id: file.id,
    file: file,
  }));
}

/**
 * Convert matches to links expected byt the D3Graph class.
 */
function createLinks(matches) {
  return matches.map((match) => ({
    source: match.source,
    target: match.target,
    distance: match.distance,
  }));
}

/**
 * Calculate adjacency table (node.id => set of adjacent node ids).
 */
export function getAdjacency(links, nodes) {
  const adjacency = new Map();
  for (let node of nodes) {
    adjacency.set(node.id, new Set());
  }
  for (let link of links) {
    adjacency.get(link.source).add(link.target);
    adjacency.get(link.target).add(link.source);
  }
  return adjacency;
}

/**
 * Calculate node generation for each node, where generation is a length
 * of shortest path from the origin node to the given node.
 *
 * @param origin origin node id
 * @param adjacency mapping: node.id => set of adjacent node ids.
 * @returns {Map<number, number>} node generation by id.
 */
function getNodeGenerations(origin, adjacency) {
  const generations = new Map();
  generations.set(origin, 0);
  const seen = new Set([origin]);

  let generation = 0;
  let currentGeneration = new Set([origin]);
  let nextGeneration = new Set();
  while (currentGeneration.size > 0) {
    for (const parent of currentGeneration) {
      for (const child of adjacency.get(parent)) {
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
export default function prepareGraph(originFile, matches, files) {
  const nodes = createNodes(files);
  const links = createLinks(matches);
  const adjacency = getAdjacency(links, nodes);
  const nodeGenerations = getNodeGenerations(originFile.id, adjacency);

  for (const node of nodes.values()) {
    node.generation = nodeGenerations.get(node.id);
  }

  for (const link of links) {
    link.generation = Math.min(
      nodeGenerations.get(link.source),
      nodeGenerations.get(link.target)
    );
  }

  return { links, nodes };
}
