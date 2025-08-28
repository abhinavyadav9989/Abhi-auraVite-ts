import React from 'react';
import { ensureArray } from '@/components/formatters';

// Centralized category validation and normalization
const VALID_CATEGORIES = [
  'Two-Wheeler', 'Three-Wheeler', 'Hatchback', 'Sedan', 'SUV', 'MUV', 
  'Luxury', 'Commercial', 'Electric', 'Specialised', 'Service'
];

type FieldSchema = {
  type: 'number' | 'select' | 'date' | 'text'
  min?: number
  max?: number
  required?: boolean
  options?: string[]
  maxLength?: number
}

type CategorySchema = Record<string, FieldSchema>

const CATEGORY_SCHEMAS: Record<string, CategorySchema> = {
  'Two-Wheeler': {
    engine_displacement: { type: 'number', min: 50, max: 2000, required: true },
    bike_type: { type: 'select', options: ['Scooter', 'Cruiser', 'Sport', 'Commuter'], required: false }
  },
  'Three-Wheeler': {
    cargo_capacity: { type: 'number', min: 100, max: 2000, required: true },
    usage_type: { type: 'select', options: ['Passenger', 'Goods'], required: true }
  },
  'Commercial': {
    gvw: { type: 'number', min: 1000, max: 50000, required: true },
    payload: { type: 'number', min: 500, max: 40000, required: true },
    axles: { type: 'number', min: 2, max: 8, required: true },
    permit_status: { type: 'select', options: ['National', 'State', 'Local', 'Not Available'], required: true },
    fitness_expiry: { type: 'date', required: true }
  },
  'Electric': {
    battery_health: { type: 'number', min: 0, max: 100, required: true },
    range_km: { type: 'number', min: 50, max: 1000, required: true },
    charger_type: { type: 'select', options: ['AC Slow', 'DC Fast', 'Portable'], required: false }
  },
  'Specialised': {
    special_feature: { type: 'text', maxLength: 200, required: true },
    temp_range: { type: 'text', maxLength: 50, required: false }
  }
};

export const validateVehicleCategories = (categories: string | string[]) => {
  const normalizedCategories = ensureArray<string>(categories);
  const validCategories = normalizedCategories.filter(cat => 
    VALID_CATEGORIES.includes(cat)
  );
  
  return {
    isValid: validCategories.length > 0,
    validCategories,
    invalidCategories: normalizedCategories.filter(cat => 
      !VALID_CATEGORIES.includes(cat)
    )
  };
};

export const validateCustomAttributes = (
  categories: string | string[],
  customAttributes: Record<string, unknown> = {}
) => {
  const normalizedCategories = ensureArray<string>(categories);
  const errors: Record<string, string> = {};
  const warnings: string[] = [];
  
  normalizedCategories.forEach(category => {
    const schema = CATEGORY_SCHEMAS[category];
    if (!schema) return;
    
    Object.entries(schema as CategorySchema).forEach(([fieldName, fieldSchema]) => {
      const value = (customAttributes as Record<string, unknown>)[fieldName];
      
      // Check required fields
      if (fieldSchema.required && (value === undefined || value === null || value === '')) {
        errors[fieldName] = `${fieldName} is required for ${category} vehicles`;
        return;
      }
      
      // Skip validation if field is not provided and not required
      if ((value === undefined || value === null || value === '') && !fieldSchema.required) return;
      
      // Type validation
      switch (fieldSchema.type) {
        case 'number': {
          const numValue = Number(value);
          if (Number.isNaN(numValue)) {
            errors[fieldName] = `${fieldName} must be a valid number`;
          } else {
            if (typeof fieldSchema.min === 'number' && numValue < fieldSchema.min) {
              errors[fieldName] = `${fieldName} must be at least ${fieldSchema.min}`;
            }
            if (typeof fieldSchema.max === 'number' && numValue > fieldSchema.max) {
              errors[fieldName] = `${fieldName} must not exceed ${fieldSchema.max}`;
            }
          }
          break;
        }
          
        case 'select': {
          const v = String(value);
          if (!Array.isArray(fieldSchema.options) || !fieldSchema.options.includes(v)) {
            errors[fieldName] = `${fieldName} must be one of: ${(fieldSchema.options || []).join(', ')}`;
          }
          break;
        }
          
        case 'date':
          if (Number.isNaN(Date.parse(String(value)))) {
            errors[fieldName] = `${fieldName} must be a valid date`;
          }
          break;
          
        case 'text':
          {
            const v = String(value);
            if (typeof fieldSchema.maxLength === 'number' && v.length > fieldSchema.maxLength) {
              errors[fieldName] = `${fieldName} must not exceed ${fieldSchema.maxLength} characters`;
            }
          }
          break;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

export const getCategoryRequiredFields = (categories: string | string[]) => {
  const normalizedCategories = ensureArray<string>(categories);
  const requiredFields: Record<string, FieldSchema & { category: string }> = {};
  
  normalizedCategories.forEach(category => {
    const schema = CATEGORY_SCHEMAS[category];
    if (schema) {
      Object.entries(schema as CategorySchema).forEach(([fieldName, fieldSchema]) => {
        if (fieldSchema.required) {
          requiredFields[fieldName] = {
            ...fieldSchema,
            category
          };
        }
      });
    }
  });
  
  return requiredFields;
};

export const getAvailableCategories = (): string[] => VALID_CATEGORIES;

export const getCategorySchema = (category: string): CategorySchema => CATEGORY_SCHEMAS[category] || {};

// Component for displaying validation errors
export const ValidationErrors: React.FC<{ errors?: Record<string, unknown>; className?: string }> = ({ errors, className = "" }) => {
  if (!errors || Object.keys(errors).length === 0) return null;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(errors as Record<string, unknown>).map(([field, error]) => (
        <div key={field} className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {String(error)}
        </div>
      ))}
    </div>
  );
};

export default {
  validateVehicleCategories,
  validateCustomAttributes,
  getCategoryRequiredFields,
  getAvailableCategories,
  getCategorySchema,
  ValidationErrors
};