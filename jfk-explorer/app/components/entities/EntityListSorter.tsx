'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface EntityListSorterProps {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  entityCount: number;
  isLoading?: boolean;
}

export default function EntityListSorter({
  sortField,
  sortDirection,
  onSortChange,
  entityCount,
  isLoading = false,
}: EntityListSorterProps) {
  const sortOptions = [
    { value: 'document_count', label: 'Document Count' },
    { value: 'entity_name', label: 'Name' },
    { value: 'entity_type', label: 'Type' },
  ];

  return (
    <div className="flex items-center justify-between gap-4 w-full py-2">
      <div className="text-sm font-medium text-foreground">
        {isLoading ? (
          <span className="text-muted-foreground">Loading entities...</span>
        ) : (
          <span>{entityCount.toLocaleString()} entities</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={sortField}
          onValueChange={(val) => onSortChange(val, sortDirection)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
          disabled={isLoading}
          title={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
        >
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
