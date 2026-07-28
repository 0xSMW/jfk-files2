export interface Document {
  id: string;
  title?: string;
  date?: string;
  summary?: string;
  summary_one_paragraph?: string;
  content?: string;
  tags?: string[];
  document_type?: string;
  origin_agency?: string;
  classification?: string;
  security_level?: string;
  security?: string;
  rif_number?: string;
  to?: string;
  from?: string;
  recipient?: string;
  sender?: string;
  persons_mentioned?: string[];
  subject?: string;
  key_events_or_revelations?: string[];
  organizations_mentioned?: string[];
  locations_mentioned?: string[];
}

export interface DocumentSearchParams {
  query?: string;
  tags?: string[];
  documentType?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date_asc' | 'date_desc' | 'title_asc' | 'title_desc' | 'type_asc' | 'type_desc' | 'relevance';
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
