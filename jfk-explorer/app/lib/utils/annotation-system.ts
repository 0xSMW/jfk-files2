export type FlagType = 'suspect' | 'evidence' | 'lead' | 'question' | 'important';

export interface Annotation {
  id: string;
  nodeId: string;
  nodeLabel: string;
  text: string;
  createdAt: string;
  flag?: FlagType;
  color?: string;
}

export const FLAG_CONFIGS: Record<FlagType, { label: string; color: string; badgeBg: string; text: string }> = {
  suspect: { label: 'Suspect', color: '#EF4444', badgeBg: 'bg-red-100', text: 'text-red-800' },
  evidence: { label: 'Evidence', color: '#10B981', badgeBg: 'bg-emerald-100', text: 'text-emerald-800' },
  lead: { label: 'Lead', color: '#F59E0B', badgeBg: 'bg-amber-100', text: 'text-amber-800' },
  question: { label: 'Question', color: '#3B82F6', badgeBg: 'bg-blue-100', text: 'text-blue-800' },
  important: { label: 'Important', color: '#8B5CF6', badgeBg: 'bg-purple-100', text: 'text-purple-800' }
};

export function createAnnotation(
  nodeId: string,
  nodeLabel: string,
  text: string,
  flag?: FlagType
): Annotation {
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    nodeId,
    nodeLabel,
    text,
    createdAt: new Date().toISOString(),
    flag,
    color: flag ? FLAG_CONFIGS[flag].color : '#6B7280'
  };
}
