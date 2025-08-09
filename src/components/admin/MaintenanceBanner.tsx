import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MaintenanceBanner() {
  return (
    <div className="bg-yellow-400 text-yellow-900 text-center p-2 font-semibold flex items-center justify-center gap-2">
      <AlertTriangle className="w-5 h-5" />
      <span>Maintenance Mode is ACTIVE. The platform is currently unavailable to dealers.</span>
    </div>
  );
}