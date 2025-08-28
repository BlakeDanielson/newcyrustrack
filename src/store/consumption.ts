import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  ConsumptionSession,
  CreateConsumptionSession,
  ConsumptionFilters,
  AppState,
  ConsumptionFormData,
} from '@/types/consumption';
import { storageService } from '@/lib/storage';

interface ConsumptionStore extends AppState {
  addSession: (session: CreateConsumptionSession) => Promise<void>;
  updateSession: (id: string, updates: Partial<CreateConsumptionSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  loadFilteredSessions: (filters?: ConsumptionFilters) => Promise<void>;
  setCurrentSession: (session: Partial<ConsumptionFormData>) => void;
  updateCurrentSession: (updates: Partial<ConsumptionFormData>) => void;
  clearCurrentSession: () => void;
  setActiveView: (v: AppState['activeView']) => void;
  setMobileMenu: (show: boolean) => void;
  setLoading: (l: boolean) => void;
  setSaving: (s: boolean) => void;
  setNewlyCreatedSessionId: (id: string | null) => void;
  clearNewlyCreatedSessionId: () => void;
  setFilters: (f: Partial<ConsumptionFilters>) => void;
  setSearchTerm: (t: string) => void;
  clearFilters: () => void;
  updatePreferences: (p: Partial<AppState['preferences']>) => void;
  getSessionById: (id: string) => ConsumptionSession | undefined;
  getRecentSessions: (limit?: number) => ConsumptionSession[];
  getSessionsByStrain: (strain: string) => ConsumptionSession[];
}

export const useConsumptionStore = create<ConsumptionStore>()(
  devtools(
    persist(
      (set, get) => ({
        sessions: [],
        isLoading: false,
        isSaving: false,
        filters: {},
        searchTerm: '',
        activeView: 'log',
        showMobileMenu: false,
        newlyCreatedSessionId: null,
        preferences: { defaultLocation: '', enableNotifications: false },
        addSession: async (session) => {
          set({ isSaving: true });
          try {
            const newSession = await storageService.create(session);
            set((state) => ({ sessions: [newSession, ...state.sessions], isSaving: false, newlyCreatedSessionId: newSession.id }));
          } catch (err) {
            console.error('Failed to add session', err);
            set({ isSaving: false });
          }
        },
        updateSession: async (id, updates) => {
          set({ isSaving: true });
          try {
            const updated = await storageService.update(id, updates);
            if (updated) set((state) => ({ sessions: state.sessions.map((s) => (s.id === id ? updated : s)), isSaving: false }));
          } catch (err) {
            console.error('Failed to update', err);
            set({ isSaving: false });
          }
        },
        deleteSession: async (id) => {
          set({ isLoading: true });
          try {
            const success = await storageService.delete(id);
            if (success) set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id), isLoading: false }));
          } catch (err) {
            console.error('Failed to delete', err);
            set({ isLoading: false });
          }
        },
        loadSessions: async () => {
          set({ isLoading: true });
          try {
            const sessions = await storageService.getAll();
            set({ sessions, isLoading: false });
          } catch (err) {
            console.error('Load sessions failed', err);
            set({ isLoading: false });
          }
        },
        loadFilteredSessions: async (filters) => {
          set({ isLoading: true });
          try {
            const fs = filters || get().filters;
            const sessions = await storageService.getFiltered(fs);
            set({ sessions, isLoading: false });
          } catch (err) {
            console.error('Load filtered failed', err);
            set({ isLoading: false });
          }
        },
        setCurrentSession: (s) => set({ currentSession: s }),
        updateCurrentSession: (u) => set((st) => ({ currentSession: { ...st.currentSession, ...u } })),
        clearCurrentSession: () => set({ currentSession: undefined }),
        setActiveView: (v) => set({ activeView: v, showMobileMenu: false }),
        setMobileMenu: (sh) => set({ showMobileMenu: sh }),
        setLoading: (l) => set({ isLoading: l }),
        setSaving: (s) => set({ isSaving: s }),
        setNewlyCreatedSessionId: (id) => set({ newlyCreatedSessionId: id }),
        clearNewlyCreatedSessionId: () => set({ newlyCreatedSessionId: null }),
        setFilters: (f) => set((st) => ({ filters: { ...st.filters, ...f } })),
        setSearchTerm: (t) => set({ searchTerm: t }),
        clearFilters: () => set({ filters: {}, searchTerm: '' }),
        updatePreferences: (p) => set((st) => ({ preferences: { ...st.preferences, ...p } })),
        getSessionById: (id) => get().sessions.find((s) => s.id === id),
        getRecentSessions: (limit = 10) => get().sessions.slice(0, limit),
        getSessionsByStrain: (strain) => get().sessions.filter((s) => s.strain_name.toLowerCase().includes(strain.toLowerCase())),
      }),
      { name: 'consumption-storage', partialize: (state) => ({ preferences: state.preferences, filters: state.filters, activeView: state.activeView }) },
    ),
    { name: 'consumption-store' },
  ),
);

export const useCurrentSession = () => useConsumptionStore((s) => s.currentSession);
export const useSessions = () => useConsumptionStore((s) => s.sessions);
export const useIsLoading = () => useConsumptionStore((s) => s.isLoading);
export const useIsSaving = () => useConsumptionStore((s) => s.isSaving);
export const useActiveView = () => useConsumptionStore((s) => s.activeView);
export const usePreferences = () => useConsumptionStore((s) => s.preferences);
export const useFilters = () => useConsumptionStore((s) => s.filters);
