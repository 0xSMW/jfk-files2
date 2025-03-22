'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Document } from '@/app/lib/models/document';
import DocumentCard from './DocumentCard';

interface VirtualizedDocumentListProps {
  documents: Document[];
  isLoading?: boolean;
}

export default function VirtualizedDocumentList({
  documents,
  isLoading = false
}: VirtualizedDocumentListProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate card height based on content
  const itemHeight = 220; // Approximate height for a document card
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: window.innerHeight - 200 // Adjust for header, padding, etc.
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Empty placeholder items when loading
  const placeholderItems = useMemo(() => {
    return Array(5).fill(null).map((_, i) => ({
      id: `placeholder-${i}`,
      title: '',
      summary: '',
    } as Document));
  }, []);
  
  // Items to display
  const displayItems = isLoading ? placeholderItems : documents;
  
  // Render each item in the list
  const ItemRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const document = displayItems[index];
    
    if (isLoading) {
      return (
        <div style={style} className="p-2">
          <div className="border rounded-lg p-4 bg-white animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="mt-4 flex gap-1">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div style={style} className="p-2">
        <DocumentCard document={document} />
      </div>
    );
  };
  
  // Handle empty state
  if (!isLoading && documents.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No documents found</h3>
        <p className="text-gray-600">Try adjusting your search filters.</p>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px]">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <List
          height={dimensions.height}
          width={dimensions.width}
          itemCount={displayItems.length}
          itemSize={itemHeight}
        >
          {ItemRenderer}
        </List>
      )}
    </div>
  );
} 