import 'server-only';
import fs from 'fs';
import path from 'path';
import { Document } from '../models/document';
import { Entity } from '../models/entity';

// In-memory cache
let cachedDocuments: Document[] | null = null;
let cachedEntities: Entity[] | null = null;

export async function loadDocumentMetadata(): Promise<Document[]> {
  if (cachedDocuments) return cachedDocuments;

  try {
    const dir = path.join(process.cwd(), 'public/json/2025');
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      const docs: Document[] = [];

      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
          const data = JSON.parse(raw);
          const id = file.replace(/\.json$/, '');
          docs.push({
            id,
            ...data,
            document_type: data.document_type || 'Document'
          });
        } catch (e) {
          // ignore bad json
        }
      }
      cachedDocuments = docs;
      return docs;
    }
  } catch (e) {
    console.error('Error reading documents:', e);
  }

  return cachedDocuments || [];
}

export async function loadDocumentsByIds(ids: string[]): Promise<Document[]> {
  const allDocs = await loadDocumentMetadata();
  const idSet = new Set(ids.map(id => id.replace(/^doc-/, '')));
  return allDocs.filter(d => idSet.has(d.id));
}

export async function loadDocument(id: string): Promise<Document | null> {
  const docs = await loadDocumentMetadata();
  let doc = docs.find(d => d.id === id || d.id === decodeURIComponent(id));

  if (!doc) {
    try {
      const filePath = path.join(process.cwd(), `public/json/2025/${id}.json`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        doc = { id, ...data };
      }
    } catch (e) {
      // ignore
    }
  }

  if (!doc) return null;

  if (!doc.content) {
    try {
      const mdPath = path.join(process.cwd(), `public/md/2025/${id}.md`);
      if (fs.existsSync(mdPath)) {
        doc.content = fs.readFileSync(mdPath, 'utf-8');
      }
    } catch (e) {
      // ignore
    }
  }

  return doc;
}

export async function loadAllEntities(): Promise<Entity[]> {
  if (cachedEntities) return cachedEntities;

  try {
    const dir = path.join(process.cwd(), 'public/json/entity_summaries');
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      const entities: Entity[] = [];

      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
          const data = JSON.parse(raw);
          const slug = file.replace(/\.json$/, '');
          entities.push({
            slug,
            ...data,
            entity_name: data.entity_name || slug,
            entity_type: data.entity_type || 'tag',
            document_count: data.document_count || (data.document_ids ? data.document_ids.length : 0),
            key_connections: data.key_connections || [],
            document_ids: data.document_ids || []
          });
        } catch (e) {
          // ignore bad json
        }
      }
      cachedEntities = entities;
      return entities;
    }
  } catch (e) {
    console.error('Error reading entities:', e);
  }

  return cachedEntities || [];
}

export async function loadEntityBySlug(slug: string): Promise<Entity | null> {
  const entities = await loadAllEntities();
  const decodedSlug = decodeURIComponent(slug);
  let entity = entities.find(e => e.slug === slug || e.slug === decodedSlug || e.entity_name === decodedSlug);

  if (!entity) {
    try {
      const filePath = path.join(process.cwd(), `public/json/entity_summaries/${slug}.json`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        entity = { slug, ...data };
      }
    } catch (e) {
      // ignore
    }
  }

  return entity || null;
}

export async function getDataStatistics() {
  const docs = await loadDocumentMetadata();
  const entities = await loadAllEntities();

  const documentsWithTags = docs.filter(d => d.tags && d.tags.length > 0).length;
  const tagSet = new Set<string>();
  docs.forEach(d => d.tags?.forEach(t => tagSet.add(t)));

  return {
    documentCount: docs.length,
    entityCount: entities.length,
    linkCount: docs.reduce((acc, d) => acc + (d.tags?.length || 0), 0),
    totalDocuments: docs.length,
    documentsWithTags,
    uniqueTags: tagSet.size,
    totalEntities: entities.length,
    matchingTags: tagSet.size
  };
}
