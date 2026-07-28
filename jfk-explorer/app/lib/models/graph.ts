export interface GraphNode {
  id: string;
  label: string;
  name?: string;
  type: 'document' | 'entity' | string;
  subType?: string;
  group?: string | number;
  val?: number;
  color?: string;
  metadata?: Record<string, any>;
  slug?: string;
  docId?: string;
  entityName?: string;
  x?: number;
  y?: number;
  z?: number;
  [key: string]: any;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  type?: string;
  value?: number;
  strength?: number;
  color?: string;
  [key: string]: any;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  edges?: GraphLink[];
}

export interface GraphFilterOptions {
  maxNodes?: number;
  documentTypes?: string[];
  entityTypes?: string[];
  searchQuery?: string;
  nodeTypes?: string[];
  minConnections?: number;
}

export interface GraphConfig {
  nodeSize?: number;
  linkWidth?: number;
  chargeStrength?: number;
  linkDistance?: number;
  showLabels?: boolean;
  colorByGroup?: boolean;
  is3D?: boolean;
  nodeColor?: string;
  linkColor?: string;
}
