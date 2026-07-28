import { GraphData, GraphNode, GraphLink } from '../models/graph';

export interface PathResult {
  path: GraphNode[];
  links: GraphLink[];
  distance: number;
  found: boolean;
}

export function findShortestPath(
  graphData: GraphData,
  sourceId: string,
  targetId: string
): PathResult {
  if (sourceId === targetId) {
    const node = graphData.nodes.find(n => n.id === sourceId);
    return {
      path: node ? [node] : [],
      links: [],
      distance: 0,
      found: true
    };
  }

  // Build adjacency list
  const adjMap = new Map<string, Array<{ neighborId: string; link: GraphLink }>>();

  graphData.nodes.forEach(n => adjMap.set(n.id, []));

  graphData.links.forEach(link => {
    const sId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const tId = typeof link.target === 'string' ? link.target : (link.target as any).id;

    if (adjMap.has(sId)) {
      adjMap.get(sId)!.push({ neighborId: tId, link });
    }
    if (adjMap.has(tId)) {
      adjMap.get(tId)!.push({ neighborId: sId, link });
    }
  });

  // Breadth-First Search
  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  const parentMap = new Map<string, { parentId: string; link: GraphLink }>();

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) {
      found = true;
      break;
    }

    const neighbors = adjMap.get(current) || [];
    for (const { neighborId, link } of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        parentMap.set(neighborId, { parentId: current, link });
        queue.push(neighborId);
      }
    }
  }

  if (!found) {
    return { path: [], links: [], distance: -1, found: false };
  }

  // Reconstruct path
  const pathNodeIds: string[] = [targetId];
  const pathLinks: GraphLink[] = [];
  let curr = targetId;

  while (curr !== sourceId) {
    const edge = parentMap.get(curr);
    if (!edge) break;
    pathLinks.unshift(edge.link);
    curr = edge.parentId;
    pathNodeIds.unshift(curr);
  }

  const nodeDict = new Map<string, GraphNode>();
  graphData.nodes.forEach(n => nodeDict.set(n.id, n));

  const pathNodes = pathNodeIds
    .map(id => nodeDict.get(id))
    .filter((n): n is GraphNode => n !== undefined);

  return {
    path: pathNodes,
    links: pathLinks,
    distance: pathLinks.length,
    found: true
  };
}
