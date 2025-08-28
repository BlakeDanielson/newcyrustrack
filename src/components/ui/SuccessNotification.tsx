'use client';
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { message: string; onComplete?: () => void; duration?: number; className?: string; }

const SuccessNotification: React.FC<Props> = ({ message, onComplete, duration = 2000, className }) => {
  const [visible, setVisible] = useState(true);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 200);
    const t2 = setTimeout(() => { setVisible(false); setTimeout(() => onComplete?.(), 300); }, duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [duration, onComplete]);
  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0 pointer-events-none', className)}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative flex flex-col items-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping delay-200" />
          <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-ping delay-400" />
          <div className={cn('relative w-16 h-16 bg-green-500 rounded-full flex items-center justify-center transition-all duration-300', show ? 'scale-100 opacity-100' : 'scale-75 opacity-0')}>
            <Check className={cn('w-8 h-8 text-white transition-transform duration-300', show ? 'scale-100' : 'scale-75')} />
          </div>
        </div>
        <div className={cn('bg-white rounded-lg px-6 py-3 shadow-lg transition-all duration-300', show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')}>
          <p className="text-gray-900 font-medium text-center">{message}</p>
        </div>
      </div>
    </div>
  );
};
export default SuccessNotification;
