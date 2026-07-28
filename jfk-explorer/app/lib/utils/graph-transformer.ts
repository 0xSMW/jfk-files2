import { GraphData, GraphNode, GraphLink, GraphFilterOptions } from '../models/graph';
import { loadDocumentMetadata, loadAllEntities, loadDocument, loadEntityBySlug } from './data-loader';
import { DOCUMENT_COLORS, ENTITY_COLORS, LINK_COLORS } from './visualization-colors';
import { slugify } from './helpers';
import { Document } from '../models/document';
import { Entity } from '../models/entity';

// Identity Helpers
export function documentNodeId(id: string): string {
  return `doc-${id.replace(/^doc-/, '')}`;
}

export function entityNodeId(slug: string): string {
  return `entity-${slug.replace(/^entity-/, '')}`;
}

// Extractor for all document relationship targets
export function getDocumentRelationships(doc: Document): Array<{ name: string; type: string; group: string }> {
  const rels: Array<{ name: string; type: string; group: string }> = [];

  (doc.tags || []).forEach(t => rels.push({ name: t, type: 'tagged with', group: 'tag' }));
  (doc.persons_mentioned || []).forEach(p => rels.push({ name: p, type: 'mentioned in', group: 'person' }));
  (doc.organizations_mentioned || []).forEach(o => rels.push({ name: o, type: 'mentioned in', group: 'organization' }));
  (doc.locations_mentioned || []).forEach(l => rels.push({ name: l, type: 'located at', group: 'location' }));
  if (doc.sender) rels.push({ name: doc.sender, type: 'sent by', group: 'sender' });
  if (doc.recipient) rels.push({ name: doc.recipient, type: 'received by', group: 'recipient' });

  return rels;
}

export async function generateGraphData(filterOptions: GraphFilterOptions = {}): Promise<GraphData> {
  let docs = await loadDocumentMetadata();
  let entities = await loadAllEntities();

  // Build entity lookup index: normalized name -> Entity object
  const entityNameMap = new Map<string, Entity>();
  const entitySlugMap = new Map<string, Entity>();

  entities.forEach(e => {
    if (e.slug) entitySlugMap.set(e.slug, e);
    if (e.entity_name) {
      entityNameMap.set(e.entity_name.toLowerCase().trim(), e);
      entityNameMap.set(slugify(e.entity_name), e);
    }
  });

  // Apply document type filter
  if (filterOptions.documentTypes && filterOptions.documentTypes.length > 0) {
    docs = docs.filter(d => filterOptions.documentTypes!.includes(d.document_type || 'Document'));
  }

  // Apply entity type filter
  if (filterOptions.entityTypes && filterOptions.entityTypes.length > 0) {
    entities = entities.filter(e => filterOptions.entityTypes!.includes(e.entity_type || 'tag'));
  }

  // Apply search query filter
  if (filterOptions.searchQuery && filterOptions.searchQuery.trim() !== '') {
    const q = filterOptions.searchQuery.toLowerCase();
    docs = docs.filter(d =>
      (d.title && d.title.toLowerCase().includes(q)) ||
      (d.summary_one_paragraph && d.summary_one_paragraph.toLowerCase().includes(q)) ||
      (d.summary && d.summary.toLowerCase().includes(q)) ||
      (d.id && d.id.toLowerCase().includes(q))
    );
    entities = entities.filter(e =>
      (e.entity_name && e.entity_name.toLowerCase().includes(q)) ||
      (e.summary && e.summary.toLowerCase().includes(q))
    );
  }

  // Sort documents by relationship connectivity score (descending)
  docs = [...docs].sort((a, b) => {
    const scoreA = getDocumentRelationships(a).length;
    const scoreB = getDocumentRelationships(b).length;
    return scoreB - scoreA;
  });

  const maxNodes = filterOptions.maxNodes || 100;
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Map<string, GraphNode>();

  const docCount = Math.min(docs.length, Math.floor(maxNodes * 0.6));
  const selectedDocs = docs.slice(0, docCount);

  selectedDocs.forEach(d => {
    const nodeId = documentNodeId(d.id);
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

  // Collect candidate entities referenced directly by selected documents
  const referencedEntitySlugs = new Set<string>();
  selectedDocs.forEach(d => {
    const rels = getDocumentRelationships(d);
    rels.forEach(rel => {
      const match = entityNameMap.get(rel.name.toLowerCase().trim()) || entityNameMap.get(slugify(rel.name));
      if (match && match.slug) {
        referencedEntitySlugs.add(match.slug);
      }
    });
  });

  // Prioritize entities referenced by documents first, then remaining entities by document_count
  const prioritizedEntities = [
    ...entities.filter(e => e.slug && referencedEntitySlugs.has(e.slug)),
    ...entities.filter(e => e.slug && !referencedEntitySlugs.has(e.slug)).sort((a, b) => (b.document_count || 0) - (a.document_count || 0))
  ];

  const entityBudget = Math.min(prioritizedEntities.length, maxNodes - nodes.length);
  const selectedEntities = prioritizedEntities.slice(0, entityBudget);

  selectedEntities.forEach(e => {
    if (!e.slug) return;
    const nodeId = entityNodeId(e.slug);
    if (!nodeMap.has(nodeId)) {
      const node: GraphNode = {
        id: nodeId,
        label: e.entity_name,
        name: e.entity_name,
        type: 'entity',
        group: e.entity_type || 'entity',
        subType: e.entity_type,
        color: ENTITY_COLORS[e.entity_type] || ENTITY_COLORS.default,
        val: Math.min(10, Math.max(4, (e.document_count || 1) / 2)),
        slug: e.slug,
        entityName: e.entity_name,
        metadata: e
      };
      nodeMap.set(nodeId, node);
      nodes.push(node);
    }
  });

  // Build document-to-entity links
  selectedDocs.forEach(d => {
    const docNodeId = documentNodeId(d.id);
    const rels = getDocumentRelationships(d);

    rels.forEach(rel => {
      const match = entityNameMap.get(rel.name.toLowerCase().trim()) || entityNameMap.get(slugify(rel.name));
      if (match && match.slug) {
        const eNodeId = entityNodeId(match.slug);
        if (nodeMap.has(eNodeId)) {
          links.push({
            source: docNodeId,
            target: eNodeId,
            type: rel.type,
            label: rel.type,
            color: LINK_COLORS[rel.type] || LINK_COLORS.default,
            strength: 1
          });
        }
      }
    });
  });

  // Entity-to-entity key_connections
  selectedEntities.forEach(e => {
    if (!e.slug) return;
    const sourceNodeId = entityNodeId(e.slug);
    (e.key_connections || []).forEach(conn => {
      const match = entityNameMap.get(conn.toLowerCase().trim()) || entityNameMap.get(slugify(conn));
      if (match && match.slug) {
        const targetNodeId = entityNodeId(match.slug);
        if (nodeMap.has(targetNodeId) && sourceNodeId !== targetNodeId) {
          links.push({
            source: sourceNodeId,
            target: targetNodeId,
            type: 'connected to',
            label: 'connected to',
            color: LINK_COLORS['connected to'] || LINK_COLORS.default,
            strength: 0.5
          });
        }
      }
    });
  });

  return { nodes, links, edges: links };
}

export async function generateDocumentCentricGraph(documentId: string, maxEntities: number = 15): Promise<GraphData> {
  const doc = await loadDocument(documentId);
  if (!doc) return { nodes: [], links: [] };

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const centerNodeId = documentNodeId(doc.id);
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

  const rels = getDocumentRelationships(doc).slice(0, maxEntities);

  rels.forEach(rel => {
    const slug = slugify(rel.name);
    const entityNode = entityNodeId(slug);
    nodes.push({
      id: entityNode,
      label: rel.name,
      name: rel.name,
      type: 'entity',
      group: rel.group,
      color: ENTITY_COLORS[rel.group] || ENTITY_COLORS.default,
      val: 6,
      slug,
      entityName: rel.name
    });
    links.push({
      source: centerNodeId,
      target: entityNode,
      type: rel.type,
      label: rel.type,
      color: LINK_COLORS[rel.type] || LINK_COLORS.default
    });
  });

  return { nodes, links, edges: links };
}

export async function generateEntityCentricGraph(entityNameOrSlug: string): Promise<GraphData> {
  const entity = await loadEntityBySlug(entityNameOrSlug);
  const name = entity ? entity.entity_name : entityNameOrSlug;
  const slug = entity && entity.slug ? entity.slug : slugify(name);

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const centerNodeId = entityNodeId(slug);
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
      const connSlug = slugify(conn);
      const connNode = entityNodeId(connSlug);
      nodes.push({
        id: connNode,
        label: conn,
        name: conn,
        type: 'entity',
        group: 'connection',
        color: ENTITY_COLORS.default,
        val: 5,
        slug: connSlug,
        entityName: conn
      });
      links.push({
        source: centerNodeId,
        target: connNode,
        type: 'connected to',
        label: 'connected to',
        color: LINK_COLORS['connected to'] || LINK_COLORS.default
      });
    });
  }

  return { nodes, links, edges: links };
}
