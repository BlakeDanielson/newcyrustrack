import { ConsumptionSession, CreateConsumptionSession, ConsumptionFilters } from '@/types/consumption';

// Local storage functions to avoid circular import
const legacyStorage = {
  getAll: (): ConsumptionSession[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('cannabis-tracker-sessions');
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to load sessions from localStorage:', err);
      return [];
    }
  },
  create: (session: CreateConsumptionSession): ConsumptionSession => {
    const sessions = legacyStorage.getAll();
    const newSession: ConsumptionSession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    sessions.unshift(newSession);
    legacyStorage.saveAll(sessions);
    return newSession;
  },
  update: (id: string, updates: Partial<CreateConsumptionSession>): ConsumptionSession | null => {
    const sessions = legacyStorage.getAll();
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) return null;
    sessions[index] = { ...sessions[index], ...updates, updated_at: new Date().toISOString() };
    legacyStorage.saveAll(sessions);
    return sessions[index];
  },
  delete: (id: string): boolean => {
    const sessions = legacyStorage.getAll();
    const filteredSessions = sessions.filter((s) => s.id !== id);
    if (filteredSessions.length === sessions.length) return false;
    legacyStorage.saveAll(filteredSessions);
    return true;
  },
  getFiltered: (filters: ConsumptionFilters): ConsumptionSession[] => {
    let sessions = legacyStorage.getAll();
    if (filters.strainName) {
      sessions = sessions.filter(s => s.strain_name?.toLowerCase().includes(filters.strainName!.toLowerCase()));
    }
    if (filters.location) {
      sessions = sessions.filter(s => s.location?.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    if (filters.vessel) {
      sessions = sessions.filter(s => s.vessel === filters.vessel);
    }
    if (filters.startDate) {
      sessions = sessions.filter(s => new Date(s.date) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      sessions = sessions.filter(s => new Date(s.date) <= new Date(filters.endDate!));
    }
    return sessions;
  },
  clear: (): void => {
    legacyStorage.saveAll([]);
  },
  saveAll: (sessions: ConsumptionSession[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('cannabis-tracker-sessions', JSON.stringify(sessions));
    } catch (err) {
      console.error('Failed to save sessions to localStorage:', err);
    }
  },
};

const hybridStorageService = {
  getAll: async (): Promise<ConsumptionSession[]> => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) return res.json();
      throw new Error('API failed');
    } catch (err) {
      console.warn('API getAll failed; fallback local storage', err);
      return legacyStorage.getAll();
    }
  },
  create: async (s: CreateConsumptionSession): Promise<ConsumptionSession> => {
    try {
      const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
      if (res.ok) return res.json();
      throw new Error('API failed');
    } catch (err) {
      console.warn('API create failed; fallback local', err);
      return legacyStorage.create(s);
    }
  },
  update: async (id: string, updates: Partial<CreateConsumptionSession>): Promise<ConsumptionSession | null> => {
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
      if (res.ok) return res.json();
      throw new Error('API failed');
    } catch (err) {
      console.warn('API update failed; fallback', err);
      return legacyStorage.update(id, updates);
    }
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
      throw new Error('API failed');
    } catch (err) {
      console.warn('API delete failed; fallback', err);
      return legacyStorage.delete(id);
    }
  },
  getFiltered: async (filters: ConsumptionFilters): Promise<ConsumptionSession[]> => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
      const res = await fetch(`/api/sessions?${params}`);
      if (res.ok) return res.json();
      throw new Error('API failed');
    } catch (err) {
      console.warn('API filtered failed; fallback', err);
      return legacyStorage.getFiltered(filters);
    }
  },
  clear: async (): Promise<void> => {
    try {
      await fetch('/api/sessions', { method: 'DELETE' });
    } catch (err) {
      console.warn('API clear failed; fallback', err);
      legacyStorage.clear();
    }
  },
  exportData: async (): Promise<string> => {
    const sessions = await hybridStorageService.getAll();
    return JSON.stringify(sessions, null, 2);
  },
  importData: (json: string): ConsumptionSession[] | null => {
    try {
      const sessions = JSON.parse(json);
      // This is a placeholder - in a real implementation you might want to bulk insert
      return sessions;
    } catch (e) {
      console.error('Failed to import data:', e);
      return null;
    }
  },
};

export default hybridStorageService;
