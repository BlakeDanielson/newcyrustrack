import { storageService } from '@/lib/storage';
import hybridStorageService from '@/lib/storage-hybrid';

export const autoMigration = {
  migrate: async (): Promise<{ migrated: number; skipped: boolean; error?: string }> => {
    try {
      // Check if database is available by testing API
      try {
        const testResponse = await fetch('/api/health');
        if (!testResponse.ok) {
          return { migrated: 0, skipped: true, error: 'DB unavailable' };
        }
      } catch {
        return { migrated: 0, skipped: true, error: 'DB unavailable' };
      }

      const local = await storageService.getAll();
      if (local.length === 0) return { migrated: 0, skipped: true };
      
      const db = await hybridStorageService.getAll();
      if (db.length > 0) return { migrated: 0, skipped: true, error: 'DB already populated' };
      
      // Migrate sessions from local storage to database
      let migrated = 0;
      for (const session of local) {
        try {
          await hybridStorageService.create(session);
          migrated++;
        } catch (e) {
          console.error('Failed to migrate session', e);
        }
      }
      
      return { migrated, skipped: false };
    } catch (e) {
      console.error('autoMigration error', e);
      return { migrated: 0, skipped: false, error: String(e) };
    }
  },
  migrateSilently: async () => {
    try { await autoMigration.migrate(); } catch (_) {}
  },
};
export default autoMigration;
