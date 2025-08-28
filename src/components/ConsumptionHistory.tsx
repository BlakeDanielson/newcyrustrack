'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { History, MapPin, Cannabis, Filter, Search } from 'lucide-react';
import { useConsumptionStore } from '@/store/consumption';
import { ConsumptionSession, formatQuantity } from '@/types/consumption';
import { cn } from '@/lib/utils';

const ConsumptionHistory: React.FC = () => {
  const {
    sessions,
    isLoading,
    loadSessions,
    searchTerm,
    setSearchTerm,
    filters,
    newlyCreatedSessionId,
    clearNewlyCreatedSessionId,
    setCurrentSession,
    setActiveView
  } = useConsumptionStore();

  const [showFilters, setShowFilters] = useState(false);

  const handleEditSession = (session: ConsumptionSession) => {
    setCurrentSession({ ...session, quantity: session.quantity.amount });
    setActiveView('log');
  };

  useEffect(() => {
    loadSessions();
    clearNewlyCreatedSessionId();
  }, [loadSessions, clearNewlyCreatedSessionId]);

  const filteredSessions = sessions.filter((session) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.strain_name.toLowerCase().includes(searchLower) ||
        session.location.toLowerCase().includes(searchLower) ||
        session.vessel.toLowerCase().includes(searchLower) ||
        session.who_with.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Consumption History</h1>
        <span className="text-sm text-gray-500 ml-auto">
          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by strain, location, vessel, or who with..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={cn("px-4 py-2 border rounded-md transition-colors flex items-center gap-2", showFilters ? "bg-green-100 border-green-500 text-green-700" : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100")}>
            <Filter className="h-4 w-4" />Filters
          </button>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <Cannabis className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
          <p className="text-gray-500">
            {searchTerm || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "Start by logging your first consumption session"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session: ConsumptionSession) => (
            <div key={session.id} className={cn("bg-white rounded-lg border p-6 hover:shadow-md transition-all duration-500", session.id === newlyCreatedSessionId ? "border-green-400 shadow-lg shadow-green-100 bg-green-50" : "border-gray-200")}>
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{session.strain_name}</h3>
                        {session.id === newlyCreatedSessionId && (<span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full animate-pulse">NEW</span>)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="capitalize">{session.vessel}</span>
                        <span>•</span>
                        <span>Quantity: {formatQuantity(session.quantity)}</span>
                        {session.thc_percentage && (<><span>•</span><span>THC: {session.thc_percentage}%</span></>)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{session.location}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(session.date + 'T' + session.time), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                  {session.who_with && (<div className="mb-3"><span className="text-sm font-medium text-gray-700">With: </span><span className="text-sm text-gray-600">{session.who_with}</span></div>)}
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => handleEditSession(session)} className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumptionHistory;
