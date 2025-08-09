import React from 'react';
import { AlertTriangle, Wifi } from 'lucide-react';

export default function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4">
      <div className="flex items-center justify-center gap-2 max-w-6xl mx-auto">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">
          No internet connection - your actions will sync when reconnected
        </span>
        <Wifi className="w-4 h-4 opacity-50" />
      </div>
    </div>
  );
}