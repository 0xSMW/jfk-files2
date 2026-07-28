import { Document, DocumentSearchParams } from '../models/document';
import { Entity, EntitySearchParams } from '../models/entity';
import { loadDocumentMetadata, loadAllEntities, loadDocument } from './data-loader';
import { isKnownDate } from './date';

/** Timestamp for sorting; unknown/invalid dates always sort last in either direction. */
function dateRank(dateStr: string | undefined | null, desc: boolean): number {
  if (!isKnownDate(dateStr)) return desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
  return new Date(dateStr!).getTime();
}

export async function searchDocuments(params: DocumentSearchParams = {}) {
  let docs = await loadDocumentMetadata();

  const { query, tags, documentType, dateFrom, dateTo, sortBy, page = 1, limit = 20 } = params;

  if (query) {
    const q = query.toLowerCase();
    docs = docs.filter(
      d =>
        d.title?.toLowerCase().includes(q) ||
        d.summary?.toLowerCase().includes(q) ||
        d.summary_one_paragraph?.toLowerCase().includes(q) ||
        d.tags?.some(t => t.toLowerCase().includes(q)) ||
        d.persons_mentioned?.some(p => p.toLowerCase().includes(q)) ||
        d.origin_agency?.toLowerCase().includes(q)
    );
  }

  if (documentType) {
    docs = docs.filter(d => d.document_type === documentType);
  }

  if (tags && tags.length > 0) {
    docs = docs.filter(d => d.tags && tags.every(t => d.tags!.includes(t)));
  }

  if (dateFrom) {
    docs = docs.filter(d => d.date && d.date >= dateFrom);
  }

  if (dateTo) {
    docs = docs.filter(d => d.date && d.date <= dateTo);
  }

  // Sort
  if (sortBy) {
    docs = [...docs].sort((a, b) => {
      if (sortBy === 'date_asc') return dateRank(a.date, false) - dateRank(b.date, false);
      if (sortBy === 'date_desc') return dateRank(b.date, true) - dateRank(a.date, true);
      if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title_desc') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'type_asc') return (a.document_type || '').localeCompare(b.document_type || '');
      if (sortBy === 'type_desc') return (b.document_type || '').localeCompare(a.document_type || '');
      return 0;
    });
  }

  const allDocs = await loadDocumentMetadata();
  const documentTypes = Array.from(new Set(allDocs.map(d => d.document_type).filter(Boolean))) as string[];
  const tagSet = new Set<string>();
  allDocs.forEach(d => d.tags?.forEach(t => tagSet.add(t)));
  const availableTags = Array.from(tagSet);

  const totalCount = docs.length;
  const startIndex = (page - 1) * limit;
  const paginatedDocs = docs.slice(startIndex, startIndex + limit);

  return {
    documents: paginatedDocs,
    totalCount,
    total: totalCount,
    documentTypes,
    availableTags
  };
}

export async function getDocumentById(id: string): Promise<Document | null> {
  return loadDocument(id);
}

export async function getRelatedDocuments(documentId: string, limit: number = 5): Promise<Document[]> {
  const currentDoc = await getDocumentById(documentId);
  if (!currentDoc) return [];

  const allDocs = await loadDocumentMetadata();
  const currentTags = new Set(currentDoc.tags || []);

  if (currentTags.size === 0) return [];

  const scoredDocs = allDocs
    .filter(d => d.id !== documentId)
    .map(d => {
      const matchCount = (d.tags || []).filter(t => currentTags.has(t)).length;
      return { doc: d, score: matchCount };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredDocs.slice(0, limit).map(item => item.doc);
}

export async function searchEntities(params: EntitySearchParams = {}) {
  let entities = await loadAllEntities();

  const { query, type, documentCount, sortBy, sortField, sortDirection = 'asc', page = 1, limit = 20 } = params;

  if (query) {
    const q = query.toLowerCase();
    entities = entities.filter(
      e =>
        e.entity_name.toLowerCase().includes(q) ||
        e.summary?.toLowerCase().includes(q) ||
        e.key_connections.some(c => c.toLowerCase().includes(q))
    );
  }

  if (type) {
    entities = entities.filter(e => e.entity_type === type);
  }

  if (documentCount) {
    if (documentCount.min !== undefined && !isNaN(documentCount.min)) {
      entities = entities.filter(e => (e.document_count || 0) >= documentCount.min!);
    }
    if (documentCount.max !== undefined && !isNaN(documentCount.max)) {
      entities = entities.filter(e => (e.document_count || 0) <= documentCount.max!);
    }
  }

  if (sortField) {
    entities = [...entities].sort((a: any, b: any) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';
      const dir = sortDirection === 'asc' ? 1 : -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    });
  } else if (sortBy) {
    entities = [...entities].sort((a, b) => {
      if (sortBy === 'name_asc') return a.entity_name.localeCompare(b.entity_name);
      if (sortBy === 'name_desc') return b.entity_name.localeCompare(a.entity_name);
      if (sortBy === 'doc_count_desc') return (b.document_count || 0) - (a.document_count || 0);
      return 0;
    });
  }

  const allEntities = await loadAllEntities();
  const entityTypes = Array.from(new Set(allEntities.map(e => e.entity_type).filter(Boolean)));

  const totalCount = entities.length;
  const startIndex = (page - 1) * limit;
  const paginatedEntities = entities.slice(startIndex, startIndex + limit);

  return {
    entities: paginatedEntities,
    totalCount,
    total: totalCount,
    entityTypes
  };
}
