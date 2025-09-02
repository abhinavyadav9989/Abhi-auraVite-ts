import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface AutoSaveOptions<T> {
  delay?: number; // Delay in milliseconds before saving
  maxRetries?: number; // Maximum retry attempts
  retryDelay?: number; // Delay between retries
  onSave?: (data: T) => Promise<void>; // Custom save function
  onLoad?: () => Promise<T>; // Custom load function
  enabled?: boolean; // Whether auto-save is enabled
}

interface AutoSaveState {
  isSaving: boolean;
  isOffline: boolean;
  lastSaved: Date | null;
  error: string | null;
  retryCount: number;
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions<T> = {}
) {
  const {
    delay = 2000, // 2 seconds default
    maxRetries = 3,
    retryDelay = 1000,
    onSave,
    onLoad,
    enabled = true
  } = options;

  const { toast } = useToast();
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    isOffline: false,
    lastSaved: null,
    error: null,
    retryCount: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef<T>(data);
  const isInitializedRef = useRef(false);

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
      toast({
        title: "Back Online",
        description: "Your changes will be saved automatically.",
      });
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
      toast({
        title: "You're Offline",
        description: "Changes will be saved when you're back online.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Auto-save function
  const saveData = useCallback(async (dataToSave: T, retryAttempt = 0): Promise<void> => {
    if (!enabled || state.isOffline) {
      return;
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      if (onSave) {
        await onSave(dataToSave);
      } else {
        // Default save to localStorage
        const key = `vehicle_draft_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify({
          data: dataToSave,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
      }

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        retryCount: 0,
        error: null
      }));

      // Show success toast only if not the first save
      if (isInitializedRef.current) {
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved automatically.",
        });
      }

    } catch (error) {
      console.error('Auto-save failed:', error);
      
      if (retryAttempt < maxRetries) {
        setState(prev => ({ 
          ...prev, 
          retryCount: retryAttempt + 1,
          error: `Save failed, retrying... (${retryAttempt + 1}/${maxRetries})`
        }));

        // Retry after delay
        setTimeout(() => {
          saveData(dataToSave, retryAttempt + 1);
        }, retryDelay);
      } else {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: 'Failed to save draft after multiple attempts'
        }));

        toast({
          title: "Save Failed",
          description: "Could not save your draft. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [enabled, state.isOffline, onSave, maxRetries, retryDelay, toast]);

  // Debounced auto-save
  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveData(dataRef.current);
    }, delay);
  }, [delay, saveData]);

  // Trigger auto-save when data changes
  useEffect(() => {
    if (enabled && !state.isOffline) {
      debouncedSave();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, state.isOffline, debouncedSave]);

  // Load saved data
  const loadSavedData = useCallback(async (): Promise<T | null> => {
    try {
      if (onLoad) {
        return await onLoad();
      } else {
        // Default load from localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('vehicle_draft_'));
        if (keys.length === 0) return null;

        // Get the most recent draft
        const latestKey = keys.sort().pop()!;
        const saved = localStorage.getItem(latestKey);
        
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.data;
        }
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
      toast({
        title: "Load Failed",
        description: "Could not load your saved draft.",
        variant: "destructive",
      });
    }
    
    return null;
  }, [onLoad, toast]);

  // Manual save function
  const manualSave = useCallback(async () => {
    await saveData(dataRef.current);
  }, [saveData]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      if (onSave) {
        // Custom clear function
        onSave(null as T);
      } else {
        // Clear from localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('vehicle_draft_'));
        keys.forEach(key => localStorage.removeItem(key));
      }

      setState(prev => ({
        ...prev,
        lastSaved: null,
        error: null
      }));

      toast({
        title: "Draft Cleared",
        description: "Saved draft has been cleared.",
      });
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }, [onSave, toast]);

  // Initialize
  useEffect(() => {
    isInitializedRef.current = true;
  }, []);

  return {
    // State
    isSaving: state.isSaving,
    isOffline: state.isOffline,
    lastSaved: state.lastSaved,
    error: state.error,
    retryCount: state.retryCount,
    
    // Actions
    manualSave,
    loadSavedData,
    clearSavedData,
    
    // Status helpers
    hasUnsavedChanges: state.lastSaved === null,
    canSave: enabled && !state.isOffline && !state.isSaving,
    
    // Format helpers
    formatLastSaved: () => {
      if (!state.lastSaved) return 'Never';
      return state.lastSaved.toLocaleTimeString();
    },
    
    formatSaveStatus: () => {
      if (state.isOffline) return 'Offline - Will save when online';
      if (state.isSaving) return 'Saving...';
      if (state.error) return `Error: ${state.error}`;
      if (state.lastSaved) return `Last saved: ${state.lastSaved.toLocaleTimeString()}`;
      return 'Not saved yet';
    }
  };
}

// Hook for vehicle-specific auto-save
export function useVehicleAutoSave(vehicleData: Record<string, unknown>, dealerId?: string) {
  const saveToDatabase = useCallback(async (data: Record<string, unknown>) => {
    if (!data || !dealerId) return;
    
    // Save to database as draft
    const { Vehicle } = await import('@/api/entities');
    await Vehicle.create({
      ...data,
      dealer_id: dealerId,
      status: 'draft',
      is_auto_save: true
    });
  }, [dealerId]);

  const loadFromDatabase = useCallback(async () => {
    if (!dealerId) return null;
    
    // Load latest draft from database
    const { Vehicle } = await import('@/api/entities');
    const drafts = await Vehicle.filter({
      dealer_id: dealerId,
      status: 'draft',
      is_auto_save: true
    });
    
    if (drafts.length > 0) {
      // Return the most recent draft
      return drafts.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0];
    }
    
    return null;
  }, [dealerId]);

  return useAutoSave(vehicleData, {
    delay: 3000, // 3 seconds for database saves
    maxRetries: 2,
    onSave: saveToDatabase,
    onLoad: loadFromDatabase,
    enabled: !!dealerId
  });
}
