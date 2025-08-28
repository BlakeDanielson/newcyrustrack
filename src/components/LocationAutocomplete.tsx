'use client';
import React from 'react';
interface Props { value: string; onLocationSelect: (value: string, coords?: { lat: number; lng: number }) => void; placeholder?: string; required?: boolean; }
const LocationAutocomplete: React.FC<Props> = ({ value, onLocationSelect, placeholder, required }) => {
  return (
    <input
      type="text"
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(e) => onLocationSelect(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
};
export default LocationAutocomplete;
