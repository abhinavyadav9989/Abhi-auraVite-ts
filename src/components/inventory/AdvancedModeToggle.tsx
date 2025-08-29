import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, Globe } from 'lucide-react';

interface AdvancedModeToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function AdvancedModeToggle({ isEnabled, onToggle }: AdvancedModeToggleProps) {
  return (
    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center space-x-2">
        <Zap className={`w-5 h-5 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
        <Globe className={`w-5 h-5 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
      </div>
      
      <div className="flex-1">
        <Label htmlFor="advanced-mode" className="text-sm font-medium text-gray-900">
          Advanced Mode
        </Label>
                 <p className="text-xs text-gray-600">
           {isEnabled 
             ? 'Branch management with interactive cards' 
             : 'Switch to advanced branch management interface'
           }
         </p>
      </div>
      
      <Switch
        id="advanced-mode"
        checked={isEnabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-blue-600"
      />
    </div>
  );
}
