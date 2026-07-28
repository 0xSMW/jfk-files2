'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { GraphFilterOptions } from '@/app/lib/models/graph';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface FilterControlsProps {
  filterOptions: GraphFilterOptions;
  onChange: (filters: Partial<GraphFilterOptions>) => void;
  statistics: {
    totalDocuments: number;
    documentsWithTags: number;
    uniqueTags: number;
    totalEntities: number;
    matchingTags: number;
  } | null;
}

export default function FilterControls({
  filterOptions,
  onChange,
  statistics
}: FilterControlsProps) {
  // Local state for document types filter
  const [documentTypes, setDocumentTypes] = useState<string[]>(filterOptions.documentTypes || []);
  // Local state for entity types filter
  const [entityTypes, setEntityTypes] = useState<string[]>(filterOptions.entityTypes || []);
  // Local state for search
  const [searchQuery, setSearchQuery] = useState<string>(filterOptions.searchQuery || '');

  // Common document types in the JFK Files
  const commonDocumentTypes = ['Report', 'Memo', 'Letter', 'Transcript', 'Interview', 'Medical Report'];
  // Common entity types
  const commonEntityTypes = ['Person', 'Organization', 'Location', 'Event'];

  // Update local state when props change, but only if they're different
  useEffect(() => {
    const docTypesChanged =
      JSON.stringify(documentTypes) !== JSON.stringify(filterOptions.documentTypes || []);
    const entityTypesChanged =
      JSON.stringify(entityTypes) !== JSON.stringify(filterOptions.entityTypes || []);
    const searchChanged = searchQuery !== (filterOptions.searchQuery || '');

    if (docTypesChanged) {
      setDocumentTypes(filterOptions.documentTypes || []);
    }
    if (entityTypesChanged) {
      setEntityTypes(filterOptions.entityTypes || []);
    }
    if (searchChanged) {
      setSearchQuery(filterOptions.searchQuery || '');
    }
  }, [filterOptions, documentTypes, entityTypes, searchQuery]);

  // Handle document type filter change
  const handleDocTypeChange = (type: string) => {
    const newDocTypes = documentTypes.includes(type)
      ? documentTypes.filter(t => t !== type)
      : [...documentTypes, type];

    setDocumentTypes(newDocTypes);
    onChange({
      ...filterOptions,
      documentTypes: newDocTypes
    });
  };

  // Handle entity type filter change
  const handleEntityTypeChange = (type: string) => {
    const newEntityTypes = entityTypes.includes(type)
      ? entityTypes.filter(t => t !== type)
      : [...entityTypes, type];

    setEntityTypes(newEntityTypes);
    onChange({
      ...filterOptions,
      entityTypes: newEntityTypes
    });
  };

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);

    // Debounce search to avoid too many updates
    const timeoutId = setTimeout(() => {
      onChange({
        ...filterOptions,
        searchQuery: newValue
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setDocumentTypes([]);
    setEntityTypes([]);
    setSearchQuery('');

    onChange({
      ...filterOptions,
      documentTypes: [],
      entityTypes: [],
      searchQuery: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Search</h3>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title or content..."
            className="pl-8 text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Document Types</h3>
        <div className="space-y-1.5">
          {commonDocumentTypes.map(type => (
            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={documentTypes.includes(type)}
                onCheckedChange={() => handleDocTypeChange(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Entity Types</h3>
        <div className="space-y-1.5">
          {commonEntityTypes.map(type => (
            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={entityTypes.includes(type)}
                onCheckedChange={() => handleEntityTypeChange(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {(documentTypes.length > 0 || entityTypes.length > 0 || searchQuery) && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetFilters}
          className="w-full"
        >
          Reset Filters
        </Button>
      )}

      {statistics && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Data Statistics</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Total Documents</dt>
              <dd className="font-medium">{statistics.totalDocuments}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Documents with Tags</dt>
              <dd className="font-medium">{statistics.documentsWithTags}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Unique Tags</dt>
              <dd className="font-medium">{statistics.uniqueTags}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Total Entities</dt>
              <dd className="font-medium">{statistics.totalEntities}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Matching Tags</dt>
              <dd className="font-medium">{statistics.matchingTags}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
