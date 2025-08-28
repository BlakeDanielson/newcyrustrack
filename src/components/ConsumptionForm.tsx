'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Cannabis, Save } from 'lucide-react';
import { useConsumptionStore } from '@/store/consumption';
import {
  ConsumptionFormData,
  VESSEL_TYPES,
  createQuantityValue,
  VesselType
} from '@/types/consumption';
import { cn } from '@/lib/utils';
import SuccessNotification from '@/components/ui/SuccessNotification';
import LocationAutocomplete from '@/components/LocationAutocomplete';

const ConsumptionForm: React.FC = () => {
  const {
    currentSession,
    updateCurrentSession,
    addSession,
    clearCurrentSession,
    isSaving,
    preferences,
    setActiveView
  } = useConsumptionStore();

  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<ConsumptionFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    location: preferences.defaultLocation || '',
    who_with: '',
    vessel: 'Joint',
    accessory_used: 'None',
    my_vessel: true,
    my_substance: true,
    strain_name: '',
    thc_percentage: 0,
    purchased_legally: true,
    state_purchased: '',
    tobacco: false,
    kief: false,
    concentrate: false,
    quantity: 0.25,
    ...currentSession
  });

  useEffect(() => {
    updateCurrentSession(formData);
  }, [formData, updateCurrentSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionData = {
        ...formData,
        quantity: createQuantityValue(formData.vessel as VesselType, formData.quantity)
      };
      await addSession(sessionData);
      setShowSuccess(true);
      setTimeout(() => {
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm'),
          location: preferences.defaultLocation || '',
          who_with: '',
          vessel: 'Joint',
          accessory_used: 'None',
          my_vessel: true,
          my_substance: true,
          strain_name: '',
          thc_percentage: 0,
          purchased_legally: true,
          state_purchased: '',
          tobacco: false,
          kief: false,
          concentrate: false,
          quantity: 0.25
        });
        clearCurrentSession();
      }, 500);
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save session. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Cannabis className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Log Consumption Session</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4" />Date *
            </label>
            <input type="date" required value={formData.date} onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4" />Time *
            </label>
            <input type="time" required value={formData.time} onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4" />Location *
          </label>
          <LocationAutocomplete value={formData.location} onLocationSelect={(location) => setFormData(prev => ({...prev, location}))} placeholder="Start typing an address or place name..." required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Strain Name *</label>
          <input type="text" required placeholder="e.g., Blue Dream" value={formData.strain_name} onChange={(e) => setFormData(prev => ({...prev, strain_name: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vessel *</label>
          <select required value={formData.vessel} onChange={(e) => setFormData(prev => ({...prev, vessel: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            {VESSEL_TYPES.map(vessel => (<option key={vessel} value={vessel}>{vessel}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
          <input type="number" step="0.1" min="0" required value={formData.quantity} onChange={(e) => setFormData(prev => ({...prev, quantity: parseFloat(e.target.value) || 0}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <button type="submit" disabled={isSaving} className={cn("w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-md transition-colors", isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500")}>
          <Save className="h-5 w-5" />{isSaving ? 'Saving...' : 'Log Session'}
        </button>
      </form>

      {showSuccess && (<SuccessNotification message="Session logged successfully!" onComplete={() => {setShowSuccess(false); setActiveView('history');}} duration={2000} />)}
    </div>
  );
};

export default ConsumptionForm;
