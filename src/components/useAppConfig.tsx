import { useState, useEffect } from 'react';
import { AppConfig } from '@/api/entities';

// Default configurations as fallback
const DEFAULT_CONFIGS = {
  inspection_categories: [
    { id: 'exterior', name: 'Exterior Condition', points: ['Paint Quality', 'Dents/Scratches', 'Lights', 'Tires'] },
    { id: 'interior', name: 'Interior Condition', points: ['Seats', 'Dashboard', 'Electronics', 'Cleanliness'] },
    { id: 'engine', name: 'Engine & Mechanics', points: ['Engine Sound', 'Oil Levels', 'Battery', 'Brakes'] },
    { id: 'documents', name: 'Documentation', points: ['RC Validity', 'Insurance', 'Pollution Certificate', 'Service Records'] }
  ],
  // Other defaults can be added here
};

export const useAppConfig = (configType = null) => {
  const [configs, setConfigs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setIsLoading(true);
        setError(null);
  
        const filter = configType ? { config_type: configType, is_active: true } : { is_active: true };
        const configData = await AppConfig.filter(filter);
  
        const configMap = {};
        if (Array.isArray(configData)) {
            configData.forEach(config => {
                if (config.config_key && config.config_value) {
                    configMap[config.config_key] = config.config_value;
                }
            });
        }
  
        const finalConfigs = { ...DEFAULT_CONFIGS, ...configMap };
        setConfigs(finalConfigs);
  
      } catch (err) {
        console.error('Error loading app configs:', err);
        setError(err);
        setConfigs(DEFAULT_CONFIGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigs();
  }, [configType]);

  const updateConfig = async (configKey, configValue, type = 'other') => {
    // ... implementation for updating config
  };

  const getConfig = (key, defaultValue = null) => {
    return configs[key] || defaultValue;
  };

  return {
    configs,
    isLoading,
    error,
    getConfig,
    // other returned functions
  };
};

export default useAppConfig;