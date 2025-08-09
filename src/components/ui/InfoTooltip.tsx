import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export default function InfoTooltip({ children, side = 'top' }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center ml-1 cursor-pointer">
            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs bg-slate-800 text-white border-slate-700">
          <p className="text-sm">{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}