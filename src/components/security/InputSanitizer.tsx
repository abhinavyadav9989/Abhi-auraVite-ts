import { useState, useMemo } from 'react';

type SanitizeOptions = {
  allowHtml?: boolean;
  maxLength?: number;
  removeScripts?: boolean;
  trimWhitespace?: boolean;
};

type ValidateOptions = {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
};

// Input sanitization utilities for frontend
export const sanitizeInput = (input: string, options: SanitizeOptions = {}) => {
  if (!input || typeof input !== 'string') return input;
  
  const {
    allowHtml = false,
    maxLength = 1000,
    removeScripts = true,
    trimWhitespace = true
  } = options;
  
  let sanitized = input;
  
  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }
  
  // Remove script tags and javascript: protocols
  if (removeScripts) {
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }
  
  // Remove all HTML if not allowed
  if (!allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Encode potentially dangerous characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Truncate if too long
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

export const validateInput = (input: string, type: 'email' | 'phone' | 'number' | 'date' | 'text', options: ValidateOptions = {}) => {
  const errors = [];
  
  if (!input && options.required) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }
  
  if (!input) {
    return { isValid: true, errors: [] };
  }
  
  switch (type) {
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        errors.push('Please enter a valid email address');
      }
      break;
    }
      
    case 'phone': {
      const phoneRegex = /^[+]?[\d\s\-()]+$/;
      if (!phoneRegex.test(input) || input.replace(/\D/g, '').length < 10) {
        errors.push('Please enter a valid phone number');
      }
      break;
    }
      
    case 'number': {
      const numValue = Number(input);
      if (isNaN(numValue)) {
        errors.push('Please enter a valid number');
      } else {
        if (options.min !== undefined && numValue < options.min) {
          errors.push(`Value must be at least ${options.min}`);
        }
        if (options.max !== undefined && numValue > options.max) {
          errors.push(`Value must not exceed ${options.max}`);
        }
      }
      break;
    }
      
    case 'date': {
      if (isNaN(Date.parse(input))) {
        errors.push('Please enter a valid date');
      }
      break;
    }
      
    case 'text': {
      if (options.minLength && input.length < options.minLength) {
        errors.push(`Must be at least ${options.minLength} characters`);
      }
      if (options.maxLength && input.length > options.maxLength) {
        errors.push(`Must not exceed ${options.maxLength} characters`);
      }
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Hook for form validation
export const useInputValidation = (initialValues: Record<string, any> = {}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const validateField = (
    name: string,
    value: string,
    type: 'email' | 'phone' | 'number' | 'date' | 'text',
    options: { sanitize?: SanitizeOptions; validate?: ValidateOptions } = {}
  ) => {
    const sanitizedValue = sanitizeInput(value, options.sanitize ?? {});
    const validation = validateInput(sanitizedValue, type, options.validate ?? {});
    
    setErrors(prev => ({
      ...prev,
      [name]: validation.errors
    }));
    
    return {
      value: sanitizedValue,
      isValid: validation.isValid,
      errors: validation.errors
    };
  };
  
  const handleChange = (
    name: string,
    value: string,
    type: 'email' | 'phone' | 'number' | 'date' | 'text',
    options: { sanitize?: SanitizeOptions; validate?: ValidateOptions } = {}
  ) => {
    const result = validateField(name, value, type, options);
    setValues(prev => ({
      ...prev,
      [name]: result.value
    }));
  };
  
  const handleBlur = (name: string) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  const isFormValid = useMemo(() => {
    return Object.values(errors).every((fieldErrors) => {
      const errs = fieldErrors as unknown as string[];
      return !errs || errs.length === 0;
    });
  }, [errors]);
  
  return {
    values,
    errors,
    touched,
    isFormValid,
    handleChange,
    handleBlur,
    validateField
  };
};