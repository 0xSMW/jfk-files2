import { GraphData, GraphNode, GraphLink, GraphFilterOptions } from '../models/graph';
import { loadDocumentMetadata, loadAllEntities, loadDocument, loadEntityBySlug } from './data-loader';
import { DOCUMENT_COLORS, ENTITY_COLORS } from './visualization-colors';
import { slugify } from './helpers';

export async function generateGraphData(filterOptions: GraphFilterOptions = {}): Promise<GraphData> {
  const docs = await loadDocumentMetadata();
  const entities = await loadAllEntities();

  const maxNodes = filterOptions.maxNodes || 100;
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Map<string, GraphNode>();

  const docCount = Math.min(docs.length, Math.floor(maxNodes * 0.6));
  const selectedDocs = docs.slice(0, docCount);

  selectedDocs.forEach(d => {
    const nodeId = `doc-${d.id}`;
    const node: GraphNode = {
      id: nodeId,
      label: d.title || d.id,
      name: d.title || d.id,
      type: 'document',
      group: 'document',
      subType: d.document_type || 'Document',
      color: DOCUMENT_COLORS[d.document_type || 'Document'] || DOCUMENT_COLORS.default,
      val: 6,
      docId: d.id,
      metadata: d
    };
    nodeMap.set(nodeId, node);
    nodes.push(node);
  });

  const entityCount = Math.min(entities.length, maxNodes - nodes.length);
  const selectedEntities = entities.slice(0, entityCount);

  selectedEntities.forEach(e => {
    const nodeId = `entity-${slugify(e.entity_name)}`;
    const node: GraphNode = {
      id: nodeId,
      label: e.entity_name,
      name: e.entity_name,
      type: 'entity',
      group: e.entity_type || 'entity',
      subType: e.entity_type,
      color: ENTITY_COLORS[e.entity_type] || ENTITY_COLORS.default,
      val: Math.min(10, Math.max(4, (e.document_count || 1) / 2)),
      slug: e.slug || slugify(e.entity_name),
      entityName: e.entity_name,
      metadata: e
    };
    nodeMap.set(nodeId, node);
    nodes.push(node);
  });

  // Connect documents to entities by tag or doc_ids
  selectedDocs.forEach(d => {
    const docNodeId = `doc-${d.id}`;
    d.tags?.forEach(tag => {
      const entityNodeId = `entity-${slugify(tag)}`;
      if (nodeMap.has(entityNodeId)) {
        links.push({
          source: docNodeId,
          target: entityNodeId,
          label: 'tagged with',
          strength: 1
        });
      }
    });
  });

  return { nodes, links, edges: links };
}

export async function generateDocumentCentricGraph(documentId: string, maxEntities: number = 10): Promise<GraphData> {
  const doc = await loadDocument(documentId);
  if (!doc) return { nodes: [], links: [] };

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const centerNodeId = `doc-${doc.id}`;
  nodes.push({
    id: centerNodeId,
    label: doc.title || doc.id,
    name: doc.title || doc.id,
    type: 'document',
    group: 'document',
    subType: doc.document_type || 'Document',
    color: DOCUMENT_COLORS[doc.document_type || 'Document'] || DOCUMENT_COLORS.default,
    val: 10,
    docId: doc.id,
    metadata: doc
  });

  const tags = (doc.tags || []).slice(0, maxEntities);
  tags.forEach(tag => {
    const entityNodeId = `entity-${slugify(tag)}`;
    nodes.push({
      id: entityNodeId,
      label: tag,
      name: tag,
      type: 'entity',
      group: 'tag',
      color: ENTITY_COLORS.tag,
      val: 6,
      slug: slugify(tag),
      entityName: tag
    });
    links.push({
      source: centerNodeId,
      target: entityNodeId,
      label: 'tagged with'
    });
  });

  return { nodes, links, edges: links };
}

export async function generateEntityCentricGraph(entityNameOrSlug: string): Promise<GraphData> {
  const entity = await loadEntityBySlug(entityNameOrSlug);
  const name = entity ? entity.entity_name : entityNameOrSlug;
  const slug = entity ? entity.slug || slugify(name) : slugify(name);

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const centerNodeId = `entity-${slug}`;
  nodes.push({
    id: centerNodeId,
    label: name,
    name: name,
    type: 'entity',
    group: entity?.entity_type || 'tag',
    color: ENTITY_COLORS[entity?.entity_type || 'tag'] || ENTITY_COLORS.default,
    val: 10,
    slug,
    entityName: name,
    metadata: entity || undefined
  });

  if (entity?.key_connections) {
    entity.key_connections.forEach(conn => {
      const connNodeId = `entity-${slugify(conn)}`;
      nodes.push({
        id: connNodeId,
        label: conn,
        name: conn,
        type: 'entity',
        group: 'connection',
        color: ENTITY_COLORS.default,
        val: 5,
        slug: slugify(conn),
        entityName: conn
      });
      links.push({
        source: centerNodeId,
        target: connNodeId,
        label: 'connected to'
      });
    });
  }

  return { nodes, links, edges: links };
}
