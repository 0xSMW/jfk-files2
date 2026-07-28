export interface Entity {
  entity_name: string;
  entity_type: string;
  summary?: string;
  document_count: number;
  key_connections: string[];
  key_connection_slugs?: { name: string; slug: string }[];
  significance?: string;
  document_ids: string[];
  slug?: string;
}

export interface EntitySearchParams {
  query?: string;
  type?: string;
  sortBy?: 'name_asc' | 'name_desc' | 'doc_count_desc';
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  documentCount?: {
    min?: number;
    max?: number;
  };
  page?: number;
  limit?: number;
}
