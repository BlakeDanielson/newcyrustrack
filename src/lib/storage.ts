import { ConsumptionSession, CreateConsumptionSession, ConsumptionFilters } from '@/types/consumption';

export const storageService = {
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
    const sessions = storageService.getAll();
    const newSession: ConsumptionSession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    sessions.unshift(newSession);
    legacyStorageService.saveAll(sessions);
    return newSession;
  },
  getById: (id: string): ConsumptionSession | null => {
    const sessions = storageService.getAll();
    return sessions.find((s) => s.id === id) || null;
  },
  update: (id: string, updates: Partial<CreateConsumptionSession>): ConsumptionSession | null => {
    const sessions = storageService.getAll();
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) return null;
    sessions[index] = { ...sessions[index], ...updates, updated_at: new Date().toISOString() };
    legacyStorageService.saveAll(sessions);
    return sessions[index];
  },
  delete: (id: string): boolean => {
    const sessions = storageService.getAll();
    const filteredSessions = sessions.filter((s) => s.id !== id);
    if (filteredSessions.length === sessions.length) return false;
    legacyStorageService.saveAll(filteredSessions);
    return true;
  },
  getFiltered: (filters: ConsumptionFilters): ConsumptionSession[] => {
    let sessions = storageService.getAll();
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
    legacyStorageService.saveAll([]);
  },
  exportData: (): string => {
    const sessions = storageService.getAll();
    return JSON.stringify(sessions, null, 2);
  },
  importData: (json: string): ConsumptionSession[] | null => {
    try {
      const sessions = JSON.parse(json);
      legacyStorageService.saveAll(sessions);
      return sessions;
    } catch (e) {
      console.error('Failed to import data:', e);
      return null;
    }
  },
};

export const legacyStorageService = {
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
  saveAll: (sessions: ConsumptionSession[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('cannabis-tracker-sessions', JSON.stringify(sessions));
    } catch (err) {
      console.error('Failed to save sessions to localStorage:', err);
    }
  },
};
