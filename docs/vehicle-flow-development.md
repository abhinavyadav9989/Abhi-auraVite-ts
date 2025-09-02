# Vehicle Adding Flow - Developer Documentation

## Overview

Technical documentation for the Vehicle Adding Flow system covering architecture, components, services, and implementation guidelines.

## Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI**: Shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Testing**: Vitest, React Testing Library

### Component Structure
```
AddVehicle (Main Container)
├── StepProgress (Navigation)
├── Step Components (Conditional)
│   ├── IdentifyStep
│   ├── CoreSpecsStep
│   ├── ConditionStep
│   ├── DocumentsStep
│   ├── MediaStep
│   ├── PricingStep
│   └── ReviewStep
└── UI Components
    ├── AutoFillDisplay
    ├── MarginPrivacy
    └── DocumentUpload
```

## Services

### Core Services

#### Vehicle Auto-Fill Service
```typescript
class VehicleAutoFillService {
  fillFromRegistration(regNumber: string): Promise<AutoFillResult>
  fillFromVIN(vin: string): Promise<AutoFillResult>
  fillFromDocument(file: File): Promise<AutoFillResult>
  fillFromMultipleSources(...): Promise<AutoFillResult>
  mergeResults(results: AutoFillResult[]): AutoFillResult
}
```

#### RTO Service
```typescript
class RTOService {
  validateRegistrationNumber(regNumber: string): RTOValidationResult
  fetchVehicleData(regNumber: string): Promise<RTOResponse>
}
```

#### VIN Service
```typescript
class VINService {
  validateVIN(vin: string): VINValidationResult
  decodeVIN(vin: string): Promise<VINResponse>
}
```

#### OCR Service
```typescript
class OCRService {
  processDocument(file: File): Promise<OCRResponse>
  processBatch(files: File[]): Promise<OCRResponse[]>
}
```

## Data Flow

### Auto-Fill Flow
```
Input Source → Service → API Call → Data Processing → Cache → Return
     ↓
LLM Fallback (if API fails)
     ↓
Data Validation → Confidence Scoring → Result
```

### Validation Flow
```
Field Input → Field Validation → Step Validation → Cross-Field Validation
     ↓
Error Collection → User Feedback → Correction → Re-validation
```

## Database Schema

### Enhanced Vehicles Table
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id),
  branch_id UUID REFERENCES branches(id),
  
  -- Basic identification
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  variant VARCHAR(100),
  year INTEGER NOT NULL,
  registration_number VARCHAR(20) UNIQUE,
  vin VARCHAR(17) UNIQUE,
  
  -- Specifications
  fuel_type VARCHAR(20) NOT NULL,
  transmission VARCHAR(20) NOT NULL,
  body_type VARCHAR(20) NOT NULL,
  engine_capacity INTEGER,
  seating_capacity INTEGER,
  color VARCHAR(50),
  kilometers INTEGER NOT NULL,
  owners_count INTEGER DEFAULT 1,
  
  -- Condition
  tyres_ok BOOLEAN,
  paint_ok BOOLEAN,
  accident_history BOOLEAN,
  service_history BOOLEAN,
  condition_notes TEXT,
  
  -- Documents
  rc_available BOOLEAN,
  insurance_status VARCHAR(20),
  insurance_valid_until DATE,
  puc_valid_until DATE,
  service_records_uploaded BOOLEAN,
  
  -- Pricing
  stock_type VARCHAR(20) NOT NULL DEFAULT 'owned',
  base_cost DECIMAL(12,2),
  dealer_margin_target DECIMAL(12,2),
  dealer_net DECIMAL(12,2),
  shown_price DECIMAL(12,2),
  dealer_price DECIMAL(12,2),
  exposure_mode VARCHAR(20) NOT NULL DEFAULT 'masked',
  
  -- Metadata
  auto_fill_source VARCHAR(50),
  auto_fill_confidence DECIMAL(3,2),
  auto_fill_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## State Management

### Component State
```typescript
interface AddVehicleState {
  currentStep: number;
  vehicleData: Partial<VehicleData>;
  autoFilledData: AutoFilledData;
  validationErrors: ValidationError[];
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}
```

### Auto-Save Implementation
```typescript
export const useVehicleAutoSave = (vehicleData: Partial<VehicleData>) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      await supabase
        .from('vehicle_drafts')
        .upsert({
          user_id: auth.user?.id,
          data: vehicleData,
          updated_at: new Date().toISOString()
        });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [vehicleData]);
  
  // Auto-save on data changes
  useEffect(() => {
    const timeoutId = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timeoutId);
  }, [saveDraft]);
  
  return { lastSaved, isSaving, saveDraft };
};
```

## Validation System

### Validation Architecture
```typescript
interface ValidationError {
  field: string;
  code: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

// Field-level validation
const FIELD_VALIDATIONS: Record<string, FieldValidation> = {
  registration_number: {
    required: false,
    pattern: /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/,
    message: 'Invalid registration number format',
    validate: (value: string) => validateRegistrationNumber(value)
  },
  vin: {
    required: false,
    pattern: /^[A-HJ-NPR-Z0-9]{17}$/,
    message: 'VIN must be 17 characters (excluding I, O, Q)',
    validate: (value: string) => validateVIN(value)
  }
};
```

## Error Handling

### Custom Error Class
```typescript
export class VehicleFlowError extends Error {
  public code: string;
  public severity: 'error' | 'warning' | 'info';
  public recoverable: boolean;
  public context?: ErrorContext;
  public timestamp: Date;
  
  constructor(
    code: string,
    message: string,
    severity: 'error' | 'warning' | 'info' = 'error',
    recoverable: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'VehicleFlowError';
    this.code = code;
    this.severity = severity;
    this.recoverable = recoverable;
    this.context = context;
    this.timestamp = new Date();
  }
}
```

### Error Codes
```typescript
export const ERROR_CODES = {
  // Network errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  API_UNAVAILABLE: 'API_UNAVAILABLE',
  
  // Validation errors
  INVALID_REGISTRATION: 'INVALID_REGISTRATION',
  INVALID_VIN: 'INVALID_VIN',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Auto-fill errors
  AUTO_FILL_FAILED: 'AUTO_FILL_FAILED',
  LOW_CONFIDENCE_DATA: 'LOW_CONFIDENCE_DATA',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  
  // Database errors
  SAVE_FAILED: 'SAVE_FAILED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
} as const;
```

## Testing Strategy

### Test Structure
```typescript
describe('Vehicle Adding Flow', () => {
  describe('RTO Service Tests', () => {
    it('should validate registration number format correctly', async () => {
      // Test implementation
    });
    
    it('should fetch vehicle data from registration number', async () => {
      // Test implementation
    });
  });
  
  describe('VIN Service Tests', () => {
    it('should validate VIN format correctly', async () => {
      // Test implementation
    });
    
    it('should decode VIN to extract vehicle information', async () => {
      // Test implementation
    });
  });
  
  describe('OCR Service Tests', () => {
    it('should process document images correctly', async () => {
      // Test implementation
    });
    
    it('should handle OCR processing errors gracefully', async () => {
      // Test implementation
    });
  });
  
  describe('Integration Tests', () => {
    it('should complete full vehicle adding flow', async () => {
      // End-to-end test
    });
    
    it('should handle auto-fill integration correctly', async () => {
      // Integration test
    });
  });
});
```

### Mock Data
```typescript
export const createMockVehicleData = (overrides: Partial<VehicleData> = {}): VehicleData => ({
  make: 'Honda',
  model: 'City',
  variant: 'ZX',
  year: 2020,
  fuel_type: 'petrol',
  transmission: 'manual',
  body_type: 'sedan',
  engine_capacity: 1498,
  seating_capacity: 5,
  color: 'White',
  registration_number: 'MH12AB1234',
  kilometers: 50000,
  asking_price: 750000,
  shown_price: 750000,
  branch_id: 'test-branch-id',
  ...overrides
});
```

## Performance Considerations

### Caching Strategy
```typescript
class CacheManager {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  set(key: string, value: any, duration?: number): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + (duration || this.DEFAULT_CACHE_DURATION));
  }
  
  get(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }
}
```

### Lazy Loading
```typescript
const IdentifyStep = lazy(() => import('./IdentifyStep'));
const CoreSpecsStep = lazy(() => import('./CoreSpecsStep'));
const ConditionStep = lazy(() => import('./ConditionStep'));
const DocumentsStep = lazy(() => import('./DocumentsStep'));
const MediaStep = lazy(() => import('./MediaStep'));
const PricingStep = lazy(() => import('./PricingStep'));
const ReviewStep = lazy(() => import('./ReviewStep'));

const StepComponent = ({ step }: { step: number }) => {
  const StepComponent = useMemo(() => {
    switch (step) {
      case 1: return IdentifyStep;
      case 2: return CoreSpecsStep;
      case 3: return ConditionStep;
      case 4: return DocumentsStep;
      case 5: return MediaStep;
      case 6: return PricingStep;
      case 7: return ReviewStep;
      default: return IdentifyStep;
    }
  }, [step]);
  
  return (
    <Suspense fallback={<StepLoadingSkeleton />}>
      <StepComponent />
    </Suspense>
  );
};
```

### Debouncing
```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Usage in auto-save
const debouncedVehicleData = useDebounce(vehicleData, 2000);
useEffect(() => {
  if (debouncedVehicleData) {
    saveDraft(debouncedVehicleData);
  }
}, [debouncedVehicleData]);
```

## Security

### Input Sanitization
```typescript
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[&]/g, '&amp;') // Escape ampersands
    .replace(/["]/g, '&quot;') // Escape quotes
    .replace(/[']/g, '&#x27;') // Escape apostrophes
    .replace(/[/]/g, '&#x2F;'); // Escape forward slashes
};

export const validateFile = (file: File): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    errors.push({
      field: 'file',
      code: 'FILE_TOO_LARGE',
      message: 'File size must be less than 10MB',
      type: 'error'
    });
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      code: 'INVALID_FILE_TYPE',
      message: 'File type not supported. Use JPG, PNG, WebP, or PDF',
      type: 'error'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
    info: []
  };
};
```

## Build Configuration

### Vite Config
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          utils: ['date-fns', 'lodash']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts']
  }
});
```

### Environment Configuration
```typescript
interface EnvironmentConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  RTO_API_URL: string;
  VIN_API_URL: string;
  OCR_API_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

export const config: EnvironmentConfig = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  RTO_API_URL: import.meta.env.VITE_RTO_API_URL,
  VIN_API_URL: import.meta.env.VITE_VIN_API_URL,
  OCR_API_URL: import.meta.env.VITE_OCR_API_URL,
  NODE_ENV: import.meta.env.MODE as EnvironmentConfig['NODE_ENV']
};
```

## Best Practices

### Code Organization
1. **Separation of Concerns**: Keep UI, business logic, and data access separate
2. **Component Composition**: Use composition over inheritance
3. **Type Safety**: Use TypeScript strictly, avoid `any` types
4. **Error Boundaries**: Implement error boundaries for component error handling
5. **Performance**: Use React.memo, useMemo, and useCallback appropriately

### Testing Guidelines
1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test service interactions
3. **E2E Tests**: Test complete user workflows
4. **Mock External Dependencies**: Mock APIs and external services
5. **Test Coverage**: Aim for 80%+ code coverage

### Performance Guidelines
1. **Lazy Loading**: Load components and data on demand
2. **Caching**: Cache API responses and computed values
3. **Debouncing**: Debounce user input and API calls
4. **Optimization**: Use React DevTools for performance profiling
5. **Bundle Size**: Monitor and optimize bundle size

### Security Guidelines
1. **Input Validation**: Validate all user inputs
2. **Data Sanitization**: Sanitize data before storage
3. **Authentication**: Verify user permissions
4. **Encryption**: Encrypt sensitive data
5. **HTTPS**: Use HTTPS in production

---

*Last updated: December 2024*
*Version: 1.0*
