'use client';

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
  isLoading = false
}: EntityListSorterProps) {
  // Available sort options
  const sortOptions = [
    { value: 'document_count', label: 'Document Count' },
    { value: 'entity_name', label: 'Name' },
    { value: 'entity_type', label: 'Type' },
  ];
  
  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value, sortDirection);
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 border-b">
      <div className="text-sm">
        {isLoading ? (
          <span>Loading entities...</span>
        ) : (
          <span>{entityCount} entit{entityCount !== 1 ? 'ies' : 'y'}</span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <label htmlFor="sort-select" className="text-sm whitespace-nowrap">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={sortField}
          onChange={handleSortChange}
          className="text-sm border rounded-md px-2 py-1"
          disabled={isLoading}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <button
          onClick={toggleSortDirection}
          className="p-1 border rounded-md"
          disabled={isLoading}
          aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
        >
          {sortDirection === 'asc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
} 