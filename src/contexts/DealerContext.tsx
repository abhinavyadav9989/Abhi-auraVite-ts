import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities';
import { useAuth } from '@/hooks/useAuth';
import { getDealerTier, type TierLevel } from '@/lib/tierConfig';

interface DealerContextType {
  dealer: any | null;
  tier: TierLevel;
  isLoading: boolean;
  error: string | null;
  refreshDealer: () => Promise<void>;
}

const DealerContext = createContext<DealerContextType | undefined>(undefined);

export function useDealerContext() {
  const context = useContext(DealerContext);
  if (context === undefined) {
    throw new Error('useDealerContext must be used within a DealerProvider');
  }
  return context;
}

interface DealerProviderProps {
  children: ReactNode;
}

export function DealerProvider({ children }: DealerProviderProps) {
  const { user } = useAuth();
  const [dealer, setDealer] = useState<any | null>(null);
  const [tier, setTier] = useState<TierLevel>('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDealer = async () => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const dealerProfile = await Dealer.filter({ created_by: user.email });

      if (dealerProfile && dealerProfile.length > 0) {
        const dealerData = dealerProfile[0];
        setDealer(dealerData);

        // Set tier based on dealer data
        const currentTier = getDealerTier(dealerData);
        setTier(currentTier);

        console.log('DealerContext - Loaded dealer:', {
          dealerId: dealerData.id,
          activation_completed: dealerData.activation_completed,
          dashboard_type: dealerData.dashboard_type,
          detectedTier: currentTier
        });
      } else {
        setDealer(null);
        setTier('basic');
        console.warn('DealerContext - No dealer found for email:', user.email);
      }
    } catch (error) {
      console.error('DealerContext - Error loading dealer:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dealer');
      setDealer(null);
      setTier('basic');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDealer = async () => {
    await loadDealer();
  };

  useEffect(() => {
    loadDealer();
  }, [user?.email]);

  const value: DealerContextType = {
    dealer,
    tier,
    isLoading,
    error,
    refreshDealer
  };

  return (
    <DealerContext.Provider value={value}>
      {children}
    </DealerContext.Provider>
  );
}
