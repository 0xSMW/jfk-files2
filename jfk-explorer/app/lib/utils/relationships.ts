import { RelationshipGraph } from '../models/relationship';
import { loadDocument, loadEntityBySlug } from './data-loader';

export async function createRelationshipGraph(
  docIds: string[],
  entityNames: string[],
  depth: number = 1
): Promise<RelationshipGraph> {
  const nodes: Array<{ id: string; name: string; type: string }> = [];
  const edges: Array<{ source: string; target: string; type: string }> = [];

  for (const docId of docIds) {
    const doc = await loadDocument(docId);
    if (doc) {
      nodes.push({ id: doc.id, name: doc.title || doc.id, type: 'document' });
      doc.tags?.forEach(tag => {
        nodes.push({ id: tag, name: tag, type: 'tag' });
        edges.push({ source: doc.id, target: tag, type: 'tagged' });
      });
    }
  }

  for (const entityName of entityNames) {
    const entity = await loadEntityBySlug(entityName);
    if (entity) {
      nodes.push({ id: entity.entity_name, name: entity.entity_name, type: entity.entity_type });
      entity.key_connections.forEach(conn => {
        nodes.push({ id: conn, name: conn, type: 'entity' });
        edges.push({ source: entity.entity_name, target: conn, type: 'connected' });
      });
    }
  }

  return { nodes, edges };
}
