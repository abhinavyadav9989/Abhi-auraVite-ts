export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => ValidationError | null;
}

export interface StepValidation {
  required: string[];
  optional: string[];
  crossField?: (data: Record<string, unknown>) => ValidationError[];
}

// Validation rules for each field
export const FIELD_VALIDATIONS: Record<string, FieldValidation> = {
  // Identification
  registration_number: {
    pattern: /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/,
    custom: (value: string) => {
      if (!value) return null;
      if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(value)) {
        return {
          field: 'registration_number',
          message: 'Invalid registration number format (e.g., MH12AB1234)',
          type: 'error',
          code: 'INVALID_REG_FORMAT'
        };
      }
      return null;
    }
  },
  
  vin: {
    minLength: 17,
    maxLength: 17,
    pattern: /^[A-HJ-NPR-Z0-9]{17}$/,
    custom: (value: string) => {
      if (!value) return null;
      if (value.length !== 17) {
        return {
          field: 'vin',
          message: 'VIN must be exactly 17 characters',
          type: 'error',
          code: 'INVALID_VIN_LENGTH'
        };
      }
      if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(value)) {
        return {
          field: 'vin',
          message: 'VIN contains invalid characters (I, O, Q not allowed)',
          type: 'error',
          code: 'INVALID_VIN_CHARS'
        };
      }
      return null;
    }
  },

  // Basic vehicle info
  make: { required: true, minLength: 2 },
  model: { required: true, minLength: 2 },
  year: {
    required: true,
    custom: (value: number) => {
      if (!value) return null;
      const currentYear = new Date().getFullYear();
      if (value < 1900 || value > currentYear + 1) {
        return {
          field: 'year',
          message: `Year must be between 1900 and ${currentYear + 1}`,
          type: 'error',
          code: 'INVALID_YEAR'
        };
      }
      return null;
    }
  },

  fuel_type: {
    required: true,
    custom: (value: string) => {
      const validTypes = ['petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid'];
      if (!validTypes.includes(value)) {
        return {
          field: 'fuel_type',
          message: 'Invalid fuel type',
          type: 'error',
          code: 'INVALID_FUEL_TYPE'
        };
      }
      return null;
    }
  },

  transmission: {
    required: true,
    custom: (value: string) => {
      const validTypes = ['manual', 'automatic', 'amt', 'cvt'];
      if (!validTypes.includes(value)) {
        return {
          field: 'transmission',
          message: 'Invalid transmission type',
          type: 'error',
          code: 'INVALID_TRANSMISSION'
        };
      }
      return null;
    }
  },

  kilometers: {
    required: true,
    custom: (value: number) => {
      if (!value) return null;
      if (value < 0 || value > 1000000) {
        return {
          field: 'kilometers',
          message: 'Kilometers must be between 0 and 1,000,000',
          type: 'error',
          code: 'INVALID_KILOMETERS'
        };
      }
      return null;
    }
  },

  // Pricing
  shown_price: {
    required: true,
    custom: (value: number) => {
      if (!value) return null;
      if (value < 10000 || value > 100000000) {
        return {
          field: 'shown_price',
          message: 'Price must be between ₹10,000 and ₹10,00,00,000',
          type: 'error',
          code: 'INVALID_PRICE'
        };
      }
      return null;
    }
  },

  base_cost: {
    custom: (value: number) => {
      if (!value) return null;
      if (value < 0 || value > 100000000) {
        return {
          field: 'base_cost',
          message: 'Base cost must be between ₹0 and ₹10,00,00,000',
          type: 'error',
          code: 'INVALID_BASE_COST'
        };
      }
      return null;
    }
  },

  // Media
  images: {
    custom: (value: string[]) => {
      if (!value || value.length === 0) {
        return {
          field: 'images',
          message: 'At least one image is required',
          type: 'error',
          code: 'NO_IMAGES'
        };
      }
      if (value.length > 50) {
        return {
          field: 'images',
          message: 'Maximum 50 images allowed',
          type: 'warning',
          code: 'TOO_MANY_IMAGES'
        };
      }
      return null;
    }
  }
};

// Step validation rules
export const STEP_VALIDATIONS: Record<string, StepValidation> = {
  identify: {
    required: ['make', 'model', 'year'],
    optional: ['registration_number', 'vin'],
    crossField: (data: any) => {
      const errors: ValidationError[] = [];
      
      // Check if at least one identification method is provided
      if (!data.registration_number && !data.vin && !data.make) {
        errors.push({
          field: 'identification',
          message: 'Please provide either registration number, VIN, or manual vehicle details',
          type: 'error',
          code: 'NO_IDENTIFICATION'
        });
      }
      
      return errors;
    }
  },

  core_specs: {
    required: ['fuel_type', 'transmission', 'kilometers'],
    optional: ['body_type', 'color', 'ownership']
  },

  condition: {
    required: [],
    optional: ['tyres_ok', 'paint_ok', 'accident_history', 'service_history_available']
  },

  documents: {
    required: [],
    optional: ['rc_available', 'insurance_status', 'puc_valid_until']
  },

  media: {
    required: ['images'],
    optional: ['videos', 'hero_image_url']
  },

  pricing: {
    required: ['shown_price', 'stock_type'],
    optional: ['base_cost', 'dealer_margin_target', 'dealer_price'],
    crossField: (data: any) => {
      const errors: ValidationError[] = [];
      
      // Check if dealer price is less than shown price
      if (data.dealer_price && data.shown_price && data.dealer_price >= data.shown_price) {
        errors.push({
          field: 'dealer_price',
          message: 'Dealer price should be less than shown price',
          type: 'warning',
          code: 'DEALER_PRICE_TOO_HIGH'
        });
      }
      
      // Check if base cost is reasonable
      if (data.base_cost && data.shown_price && data.base_cost > data.shown_price * 0.9) {
        errors.push({
          field: 'base_cost',
          message: 'Base cost seems too high compared to shown price',
          type: 'warning',
          code: 'BASE_COST_TOO_HIGH'
        });
      }
      
      return errors;
    }
  },

  publish: {
    required: ['exposure_mode'],
    optional: ['scheduled_publish']
  }
};

// Main validation function
export function validateVehicleData(data: Record<string, unknown>, step?: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const info: ValidationError[] = [];

  // Step-specific validation
  if (step && STEP_VALIDATIONS[step]) {
    const stepValidation = STEP_VALIDATIONS[step];
    
    // Required fields
    stepValidation.required.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push({
          field,
          message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`,
          type: 'error',
          code: 'REQUIRED_FIELD'
        });
      }
    });

    // Cross-field validation
    if (stepValidation.crossField) {
      const crossFieldErrors = stepValidation.crossField(data);
      crossFieldErrors.forEach(error => {
        if (error.type === 'error') errors.push(error);
        else if (error.type === 'warning') warnings.push(error);
        else info.push(error);
      });
    }
  }

  // Field-level validation
  Object.entries(FIELD_VALIDATIONS).forEach(([field, validation]) => {
    const value = data[field];
    
    // Skip if field is empty and not required
    if (!value && !validation.required) return;

    // Required validation
    if (validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push({
        field,
        message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`,
        type: 'error',
        code: 'REQUIRED_FIELD'
      });
      return;
    }

    // Length validation
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push({
          field,
          message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be at least ${validation.minLength} characters`,
          type: 'error',
          code: 'MIN_LENGTH'
        });
      }
      
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push({
          field,
          message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be at most ${validation.maxLength} characters`,
          type: 'error',
          code: 'MAX_LENGTH'
        });
      }

      // Pattern validation
      if (validation.pattern && !validation.pattern.test(value)) {
        errors.push({
          field,
          message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} format is invalid`,
          type: 'error',
          code: 'INVALID_PATTERN'
        });
      }
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(value);
      if (customError) {
        if (customError.type === 'error') errors.push(customError);
        else if (customError.type === 'warning') warnings.push(customError);
        else info.push(customError);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info
  };
}

// Validate specific field
export function validateField(field: string, value: unknown): ValidationError | null {
  const validation = FIELD_VALIDATIONS[field];
  if (!validation) return null;

  // Required validation
  if (validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return {
      field,
      message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`,
      type: 'error',
      code: 'REQUIRED_FIELD'
    };
  }

  // Skip other validations if field is empty and not required
  if (!value && !validation.required) return null;

  // Length validation
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return {
        field,
        message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be at least ${validation.minLength} characters`,
        type: 'error',
        code: 'MIN_LENGTH'
      };
    }
    
    if (validation.maxLength && value.length > validation.maxLength) {
      return {
        field,
        message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be at most ${validation.maxLength} characters`,
        type: 'error',
        code: 'MAX_LENGTH'
      };
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(value)) {
      return {
        field,
        message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} format is invalid`,
        type: 'error',
        code: 'INVALID_PATTERN'
      };
    }
  }

  // Custom validation
  if (validation.custom) {
    return validation.custom(value);
  }

  return null;
}

// Check if step can be completed
export function canCompleteStep(step: string, data: Record<string, unknown>): boolean {
  const validation = validateVehicleData(data, step);
  return validation.isValid;
}

// Get validation summary for a step
export function getStepValidationSummary(step: string, data: Record<string, unknown>): {
  canProceed: boolean;
  requiredFields: string[];
  missingFields: string[];
  errors: ValidationError[];
  warnings: ValidationError[];
} {
  const stepValidation = STEP_VALIDATIONS[step];
  const validation = validateVehicleData(data, step);
  
  const missingFields = stepValidation?.required.filter(field => 
    !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
  ) || [];

  return {
    canProceed: validation.isValid,
    requiredFields: stepValidation?.required || [],
    missingFields,
    errors: validation.errors,
    warnings: validation.warnings
  };
}
