import { useState, useMemo } from 'react';

// Input sanitization utilities for frontend
export const sanitizeInput = (input, options = {}) => {
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

export const validateInput = (input, type, options = {}) => {
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
export const useInputValidation = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validateField = (name, value, type, options = {}) => {
    const sanitizedValue = sanitizeInput(value, options.sanitize);
    const validation = validateInput(sanitizedValue, type, options.validate);
    
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
  
  const handleChange = (name, value, type, options = {}) => {
    const result = validateField(name, value, type, options);
    setValues(prev => ({
      ...prev,
      [name]: result.value
    }));
  };
  
  const handleBlur = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  const isFormValid = useMemo(() => {
    return Object.values(errors).every(fieldErrors => 
      !fieldErrors || fieldErrors.length === 0
    );
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