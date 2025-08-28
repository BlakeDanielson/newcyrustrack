'use client';

import React, { useEffect } from 'react';
import { useConsumptionStore } from '@/store/consumption';
import Navigation from './Navigation';
import ConsumptionForm from './ConsumptionForm';
import ConsumptionHistory from './ConsumptionHistory';
import { BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { autoMigration } from '@/lib/auto-migration';

// Analytics component - simplified version for cyrustrack
const Analytics: React.FC = () => {
  const { sessions } = useConsumptionStore();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <span className="text-sm text-gray-500 ml-auto">
          Based on {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Overview</h3>
        <p className="text-gray-600">
          You have recorded {sessions.length} consumption session{sessions.length !== 1 ? 's' : ''}.
        </p>
        {sessions.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{sessions.length}</div>
              <div className="text-sm text-green-600">Total Sessions</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {[...new Set(sessions.map((s) => s.strain_name).filter(Boolean))].length}
              </div>
              <div className="text-sm text-blue-600">Unique Strains</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {[...new Set(sessions.map((s) => s.location).filter(Boolean))].length}
              </div>
              <div className="text-sm text-purple-600">Locations</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  const { preferences, updatePreferences, loadSessions } = useConsumptionStore();

  const handlePreferenceChange = (key: keyof typeof preferences, value: string | boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleExportData = async () => {
    try {
      // Dynamic import to avoid ESLint error
      const { storageService } = await import('@/lib/storage');
      const data = await storageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyrus-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data.');
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        const { storageService } = await import('@/lib/storage');
        await storageService.clear();
        loadSessions(); // Refresh the store
        alert('All data cleared successfully!');
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Failed to clear data.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Preferences</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Location
              </label>
              <input
                type="text"
                value={preferences.defaultLocation}
                onChange={(e) => handlePreferenceChange('defaultLocation', e.target.value)}
                placeholder="e.g., Home, Apartment, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enable Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Get reminders and updates about your sessions
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.enableNotifications}
                onChange={(e) => handlePreferenceChange('enableNotifications', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Data Storage</h4>
            <p className="text-sm text-gray-500 mb-4">
              Your data is stored in a local database with automatic backup to localStorage for privacy and security.
            </p>
            <div className="space-y-2">
              <button 
                onClick={handleExportData}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Export All Data
              </button>
              <br />
              <button 
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CannabisTracker: React.FC = () => {
  const { activeView, loadSessions } = useConsumptionStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run automatic migration before loading sessions
        await autoMigration.migrateSilently();
        // Load sessions from database (or localStorage if migration failed)
        await loadSessions();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [loadSessions]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'log':
        return <ConsumptionForm />;
      case 'history':
        return <ConsumptionHistory />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <ConsumptionForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pb-20 md:pb-6">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default CannabisTracker;
