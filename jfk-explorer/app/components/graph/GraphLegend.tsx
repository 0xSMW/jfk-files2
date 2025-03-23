'use client';

import { DOCUMENT_COLORS, ENTITY_COLORS } from '@/app/lib/utils/visualization-colors';

interface GraphLegendProps {
  graphStats: {
    documentCount: number;
    entityCount: number;
    linkCount: number;
  };
}

export default function GraphLegend({ graphStats }: GraphLegendProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Legend</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1">Documents ({graphStats.documentCount})</h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(DOCUMENT_COLORS).filter(([type]) => type !== 'default').map(([type, color]) => (
                <div key={type} className="flex items-center">
                  <div className="w-3 h-3 mr-1.5" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-700 truncate">{type}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1">Entities ({graphStats.entityCount})</h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(ENTITY_COLORS).filter(([type]) => type !== 'default').map(([type, color]) => (
                <div key={type} className="flex items-center">
                  <div className="w-3 h-3 mr-1.5" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-700 truncate">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Network Statistics</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>Documents: {graphStats.documentCount}</p>
          <p>Entities: {graphStats.entityCount}</p>
          <p>Connections: {graphStats.linkCount}</p>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-4">
        <p>Click on nodes to explore details</p>
        <p>Use mouse wheel to zoom</p>
        <p>Drag to pan the visualization</p>
      </div>
    </div>
  );
} 