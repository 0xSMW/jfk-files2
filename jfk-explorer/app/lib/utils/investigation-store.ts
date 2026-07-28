import { GraphFilterOptions } from '../models/graph';
import { Annotation } from './annotation-system';

export interface InvestigationSession {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  pinnedNodeIds: string[];
  annotations: Annotation[];
  trail: string[];
  filterState: GraphFilterOptions;
  activeView: 'network' | 'timeline' | 'explorer';
  explorerRootNodeId?: string;
  timelineDateRange?: [string, string];
}

const SESSIONS_KEY = 'jfk_investigation_sessions';
const ACTIVE_SESSION_ID_KEY = 'jfk_active_session_id';

export function createNewSession(name: string = 'Untitled Investigation'): InvestigationSession {
  return {
    id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinnedNodeIds: [],
    annotations: [],
    trail: [],
    filterState: {
      maxNodes: 100,
      documentTypes: [],
      entityTypes: [],
      searchQuery: ''
    },
    activeView: 'network'
  };
}

export function getSavedSessions(): InvestigationSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading saved sessions:', e);
    return [];
  }
}

export function saveSession(session: InvestigationSession): void {
  if (typeof window === 'undefined') return;
  try {
    session.updatedAt = new Date().toISOString();
    const sessions = getSavedSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, session.id);
  } catch (e) {
    console.error('Error saving session:', e);
  }
}

export function getActiveSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_SESSION_ID_KEY);
}

export function deleteSession(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const sessions = getSavedSessions().filter(s => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    if (getActiveSessionId() === id) {
      localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
    }
  } catch (e) {
    console.error('Error deleting session:', e);
  }
}

export function exportSessionJSON(session: InvestigationSession): string {
  return JSON.stringify(session, null, 2);
}

export function importSessionJSON(jsonString: string): InvestigationSession | null {
  try {
    const data = JSON.parse(jsonString);

    // Schema Validation
    if (
      typeof data === 'object' &&
      data !== null &&
      typeof data.id === 'string' &&
      typeof data.name === 'string'
    ) {
      const session: InvestigationSession = {
        id: data.id,
        name: data.name,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinnedNodeIds: Array.isArray(data.pinnedNodeIds) ? data.pinnedNodeIds : [],
        annotations: Array.isArray(data.annotations) ? data.annotations : [],
        trail: Array.isArray(data.trail) ? data.trail : [],
        filterState: data.filterState || { maxNodes: 100, documentTypes: [], entityTypes: [], searchQuery: '' },
        activeView: ['network', 'timeline', 'explorer'].includes(data.activeView) ? data.activeView : 'network',
        explorerRootNodeId: data.explorerRootNodeId,
        timelineDateRange: data.timelineDateRange
      };

      saveSession(session);
      return session;
    }
  } catch (e) {
    console.error('Error importing session:', e);
  }
  return null;
}
