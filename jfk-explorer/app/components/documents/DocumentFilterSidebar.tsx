'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DocumentSearchParams } from '@/app/lib/models/document';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Tag as TagIcon, X } from 'lucide-react';

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  debouncedFn.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
  return debouncedFn as typeof debouncedFn & { cancel: () => void };
}

interface DocumentFilterSidebarProps {
  documentCount: number;
  documentTypes: string[];
  availableTags: string[];
  onFilterChange: (filters: Partial<DocumentSearchParams>) => void;
  isLoading?: boolean;
}

export default function DocumentFilterSidebar({
  documentTypes = [],
  availableTags = [],
  onFilterChange,
  isLoading = false,
}: DocumentFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'ALL');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '');

  const debouncedOnFilterChange = useMemo(() => {
    return debounce((filters: Partial<DocumentSearchParams>) => {
      onFilterChange(filters);
    }, 300);
  }, [onFilterChange]);

  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      setSelectedTags(tagsParam.split(','));
    }
  }, [searchParams]);

  useEffect(() => {
    const filters: Partial<DocumentSearchParams> = {};

    if (query) filters.query = query;
    if (selectedTags.length > 0) filters.tags = selectedTags;
    if (selectedType && selectedType !== 'ALL') filters.documentType = selectedType;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    debouncedOnFilterChange(filters);

    return () => {
      debouncedOnFilterChange.cancel();
    };
  }, [query, selectedTags, selectedType, dateFrom, dateTo, debouncedOnFilterChange]);

  useEffect(() => {
    const updateUrl = debounce(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (query) params.set('query', query);
      else params.delete('query');

      if (selectedType && selectedType !== 'ALL') params.set('type', selectedType);
      else params.delete('type');

      if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
      else params.delete('tags');

      if (dateFrom) params.set('from', dateFrom);
      else params.delete('from');

      if (dateTo) params.set('to', dateTo);
      else params.delete('to');

      const newParams = params.toString();
      const currentParams = searchParams.toString();

      if (newParams !== currentParams) {
        router.replace(`${pathname}?${newParams}`, { scroll: false });
      }
    }, 300);

    updateUrl();
    return () => updateUrl.cancel();
  }, [query, selectedTags, selectedType, dateFrom, dateTo, router, pathname, searchParams]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedType('ALL');
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
  };

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return availableTags;
    return availableTags.filter((t) =>
      t.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [availableTags, tagSearch]);

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

      {/* Search query */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or summary..."
            className="pl-8 h-9 text-sm"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Document Type */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Document Type
        </label>
        <Select
          value={selectedType}
          onValueChange={setSelectedType}
          disabled={isLoading}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {documentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1">From</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 text-xs px-2"
              disabled={isLoading}
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1">To</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 text-xs px-2"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Faceted Tag Popover Filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Tags
        </label>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between h-9 text-xs font-normal"
                disabled={isLoading}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <TagIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {selectedTags.length > 0
                    ? `${selectedTags.length} selected`
                    : 'Filter tags...'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <ScrollArea className="h-48 pr-2">
                {filteredTags.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2 text-center">
                    No matching tags
                  </p>
                ) : (
                  <div className="space-y-1">
                    {filteredTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <span className="text-xs truncate">{tag}</span>
                      </label>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {selectedTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="font-normal gap-1 pr-1"
                >
                  <span className="truncate max-w-[120px]">{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="rounded-full hover:bg-background/80 p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag}</span>
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
