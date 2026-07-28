'use client';

import { DOCUMENT_COLORS, ENTITY_COLORS, LINK_COLORS } from '@/app/lib/utils/visualization-colors';

interface GraphLegendProps {
  graphStats: {
    documentCount: number;
    entityCount: number;
    linkCount: number;
  };
}

export default function GraphLegend({ graphStats }: GraphLegendProps) {
  return (
    <div className="space-y-4 text-xs text-foreground">
      <div>
        <h3 className="font-semibold text-foreground mb-2 uppercase tracking-wider text-[11px]">Node Legend</h3>
        
        {/* Document Types */}
        <div className="mb-3">
          <h4 className="font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <span>📄</span> Documents (Rounded Rect)
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(DOCUMENT_COLORS).filter(([t]) => t !== 'default').map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2.5 h-3 rounded-[1px]" style={{ backgroundColor: color }} />
                <span className="truncate text-[11px]">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entity Types */}
        <div className="mb-3">
          <h4 className="font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <span>👤</span> Entities (Shapes)
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(ENTITY_COLORS).filter(([t]) => t !== 'default').map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="truncate text-[11px] capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship Link Types */}
        <div>
          <h4 className="font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <span>🔗</span> Connection Types
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(LINK_COLORS).filter(([t]) => t !== 'default').map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
                <span className="truncate text-[11px] capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}