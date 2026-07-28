'use client';

import { useState, useEffect } from 'react';
import { EntitySearchParams } from '@/app/lib/models/entity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface EntityFilterSidebarProps {
  entityCount: number;
  entityTypes: string[];
  onFilterChange: (filters: Partial<EntitySearchParams>) => void;
  isLoading?: boolean;
}

export default function EntityFilterSidebar({
  entityCount,
  entityTypes = [],
  onFilterChange,
  isLoading = false
}: EntityFilterSidebarProps) {
  // Local state for search input
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [docCountMin, setDocCountMin] = useState<string>('');
  const [docCountMax, setDocCountMax] = useState<string>('');

  // Apply filters when any filter value changes
  useEffect(() => {
    const filters: Partial<EntitySearchParams> = {};

    if (searchQuery) {
      filters.query = searchQuery;
    }

    if (selectedType && selectedType !== 'ALL') {
      filters.type = selectedType;
    }

    if (docCountMin || docCountMax) {
      filters.documentCount = {};
      if (docCountMin) {
        filters.documentCount.min = parseInt(docCountMin, 10);
      }
      if (docCountMax) {
        filters.documentCount.max = parseInt(docCountMax, 10);
      }
    }

    onFilterChange(filters);
  }, [searchQuery, selectedType, docCountMin, docCountMax, onFilterChange]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setDocCountMin('');
    setDocCountMax('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold tracking-tight">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs h-7 text-muted-foreground hover:text-foreground"
          disabled={isLoading}
        >
          Reset
        </Button>
      </div>

      {/* Search filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities..."
            className="pl-8 h-9 text-sm"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Entity type filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Entity Type
        </label>
        <Select
          value={selectedType}
          onValueChange={setSelectedType}
          disabled={isLoading}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {entityTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document count filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Document Count
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1">Min</span>
            <Input
              type="number"
              min="0"
              value={docCountMin}
              onChange={(e) => setDocCountMin(e.target.value)}
              placeholder="Min"
              className="h-8 text-xs px-2"
              disabled={isLoading}
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1">Max</span>
            <Input
              type="number"
              min="0"
              value={docCountMax}
              onChange={(e) => setDocCountMax(e.target.value)}
              placeholder="Max"
              className="h-8 text-xs px-2"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="pt-4 border-t border-border text-sm text-muted-foreground">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <p>{entityCount} result{entityCount !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  );
}
