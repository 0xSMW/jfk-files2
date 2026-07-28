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

interface DocumentListSorterProps {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  documentCount: number;
  isLoading?: boolean;
}

export default function DocumentListSorter({
  sortField,
  sortDirection,
  onSortChange,
  documentCount,
  isLoading = false,
}: DocumentListSorterProps) {
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'document_type', label: 'Type' },
  ];

  return (
    <div className="flex items-center justify-between gap-4 w-full py-2">
      <div className="text-sm font-medium text-foreground">
        {isLoading ? (
          <span className="text-muted-foreground">Loading documents...</span>
        ) : (
          <span>{documentCount.toLocaleString()} documents</span>
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
