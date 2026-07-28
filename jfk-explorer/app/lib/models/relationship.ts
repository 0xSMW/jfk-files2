export interface Relationship {
  source: string;
  target: string;
  type: string;
  label?: string;
  weight?: number;
}

export interface RelationshipGraphNode {
  id: string;
  name: string;
  type: string;
}

export interface RelationshipGraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface RelationshipGraph {
  nodes: RelationshipGraphNode[];
  edges: RelationshipGraphEdge[];
}
