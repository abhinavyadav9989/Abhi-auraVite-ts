import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useDealerActivationSettings, UseDealerActivationSettingsReturn } from '@/hooks/useDealerActivationSettings';
import { useDealerContext } from './DealerContext';

interface DealerActivationContextType extends UseDealerActivationSettingsReturn {
  // Add any additional context-specific methods if needed
}

const DealerActivationContext = createContext<DealerActivationContextType | undefined>(undefined);

export function useDealerActivationContext() {
  const context = useContext(DealerActivationContext);
  if (context === undefined) {
    throw new Error('useDealerActivationContext must be used within a DealerActivationProvider');
  }
  return context;
}

interface DealerActivationProviderProps {
  children: ReactNode;
}

export function DealerActivationProvider({ children }: DealerActivationProviderProps) {
  const { dealer, isLoading: dealerLoading } = useDealerContext();
  
  // Use the existing hook but only once at the top level
  const activationSettings = useDealerActivationSettings();

  // Only provide the context when dealer is loaded
  const value: DealerActivationContextType = {
    ...activationSettings
  };

  return (
    <DealerActivationContext.Provider value={value}>
      {children}
    </DealerActivationContext.Provider>
  );
}
