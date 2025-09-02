import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AttributeField,
  FieldDependency,
  DependencyEvaluationContext,
  DependencyEvaluationResult
} from '@/types/attributeSets';
import FieldDependenciesService from '@/lib/fieldDependencies';

interface UseDynamicFormOptions {
  fields: AttributeField[];
  dependencies?: FieldDependency[];
  initialValues?: Record<string, any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  submitCount: number;
}

interface FieldState {
  isVisible: boolean;
  isRequired: boolean;
  disabled: boolean;
  options: any[];
  className: string;
}

export function useDynamicForm({
  fields,
  dependencies = [],
  initialValues = {},
  validateOnChange = true,
  validateOnBlur = true
}: UseDynamicFormOptions) {
  // Form state
  const [formState, setFormState] = useState<FormState>({
    values: { ...initialValues },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    submitCount: 0
  });

  // Field states (visibility, requirements, etc.)
  const [fieldStates, setFieldStates] = useState<Map<string, FieldState>>(new Map());

  // Dependency evaluation context
  const evaluationContext: DependencyEvaluationContext = useMemo(() => ({
    field_values: formState.values,
    dealer_tier: 'basic', // This would come from tier context
    user_role: 'dealer'  // This would come from auth context
  }), [formState.values]);

  // Initialize field states
  useEffect(() => {
    const initialFieldStates = new Map<string, FieldState>();

    fields.forEach(field => {
      initialFieldStates.set(field.id, {
        isVisible: field.isVisible,
        isRequired: field.isRequired,
        disabled: false,
        options: field.options || [],
        className: ''
      });
    });

    setFieldStates(initialFieldStates);
  }, [fields]);

  // Evaluate dependencies whenever form values change
  useEffect(() => {
    if (dependencies.length === 0) return;

    const results = FieldDependenciesService.evaluateDependencies(dependencies, evaluationContext);

    if (results.size > 0) {
      const fieldDefinitions = new Map(fields.map(field => [field.id, field]));
      const updatedStates = FieldDependenciesService.applyActions(
        Array.from(results.values()).flatMap(result => result.actions),
        fieldStates,
        fieldDefinitions
      );

      setFieldStates(updatedStates);
    }
  }, [evaluationContext, dependencies, fields]);

  // Field change handler
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormState(prevState => {
      const newValues = { ...prevState.values, [fieldId]: value };
      const newErrors = { ...prevState.errors };

      // Clear error for this field
      delete newErrors[fieldId];

      // Validate if enabled
      if (validateOnChange) {
        const field = fields.find(f => f.id === fieldId);
        if (field) {
          const error = validateField(field, value);
          if (error) {
            newErrors[fieldId] = error;
          }
        }
      }

      return {
        ...prevState,
        values: newValues,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, [fields, validateOnChange]);

  // Field blur handler
  const handleFieldBlur = useCallback((fieldId: string) => {
    setFormState(prevState => {
      const newTouched = { ...prevState.touched, [fieldId]: true };
      const newErrors = { ...prevState.errors };

      // Validate on blur if enabled
      if (validateOnBlur) {
        const field = fields.find(f => f.id === fieldId);
        if (field) {
          const error = validateField(field, prevState.values[fieldId]);
          if (error) {
            newErrors[fieldId] = error;
          }
        }
      }

      return {
        ...prevState,
        touched: newTouched,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, [fields, validateOnBlur]);

  // Form submission handler
  const handleSubmit = useCallback(async (onSubmit: (values: Record<string, any>) => Promise<void> | void) => {
    setFormState(prevState => ({ ...prevState, isSubmitting: true }));

    try {
      // Validate all visible required fields
      const validationErrors = validateForm();

      if (Object.keys(validationErrors).length > 0) {
        setFormState(prevState => ({
          ...prevState,
          errors: validationErrors,
          isValid: false,
          isSubmitting: false,
          submitCount: prevState.submitCount + 1
        }));
        return { success: false, errors: validationErrors };
      }

      // Call the submit handler
      await onSubmit(formState.values);

      setFormState(prevState => ({
        ...prevState,
        isSubmitting: false,
        submitCount: prevState.submitCount + 1
      }));

      return { success: true };
    } catch (error) {
      setFormState(prevState => ({
        ...prevState,
        isSubmitting: false,
        submitCount: prevState.submitCount + 1
      }));

      return { success: false, error };
    }
  }, [formState.values]);

  // Reset form
  const resetForm = useCallback((values?: Record<string, any>) => {
    setFormState({
      values: values || initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      submitCount: 0
    });
  }, [initialValues]);

  // Set field value programmatically
  const setFieldValue = useCallback((fieldId: string, value: any) => {
    handleFieldChange(fieldId, value);
  }, [handleFieldChange]);

  // Set field error programmatically
  const setFieldError = useCallback((fieldId: string, error: string | null) => {
    setFormState(prevState => {
      const newErrors = { ...prevState.errors };
      if (error) {
        newErrors[fieldId] = error;
      } else {
        delete newErrors[fieldId];
      }

      return {
        ...prevState,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  // Get field state
  const getFieldState = useCallback((fieldId: string) => {
    return fieldStates.get(fieldId);
  }, [fieldStates]);

  // Get visible fields only
  const getVisibleFields = useCallback(() => {
    return fields.filter(field => {
      const state = fieldStates.get(field.id);
      return state ? state.isVisible : field.isVisible;
    });
  }, [fields, fieldStates]);

  // Validation function
  const validateField = useCallback((field: AttributeField, value: any): string | null => {
    const fieldState = fieldStates.get(field.id);
    const isRequired = fieldState ? fieldState.isRequired : field.isRequired;

    // Check required
    if (isRequired) {
      if (value === null || value === undefined || value === '') {
        return `${field.label} is required`;
      }
      if (Array.isArray(value) && value.length === 0) {
        return `${field.label} is required`;
      }
    }

    // Skip further validation if empty and not required
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Field-specific validation
    if (field.validation) {
      const validation = field.validation;

      // Min length
      if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
        return `${field.label} must be at least ${validation.minLength} characters`;
      }

      // Max length
      if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
        return `${field.label} must be no more than ${validation.maxLength} characters`;
      }

      // Min value
      if (validation.min !== undefined && Number(value) < validation.min) {
        return `${field.label} must be at least ${validation.min}`;
      }

      // Max value
      if (validation.max !== undefined && Number(value) > validation.max) {
        return `${field.label} must be no more than ${validation.max}`;
      }

      // Pattern
      if (validation.pattern && typeof value === 'string') {
        try {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            return validation.customMessage || `${field.label} format is invalid`;
          }
        } catch {
          // Invalid regex, skip pattern validation
        }
      }
    }

    return null;
  }, [fieldStates]);

  // Form-level validation
  const validateForm = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const visibleFields = getVisibleFields();

    visibleFields.forEach(field => {
      const error = validateField(field, formState.values[field.id]);
      if (error) {
        errors[field.id] = error;
      }
    });

    return errors;
  }, [getVisibleFields, validateField, formState.values]);

  return {
    // Form state
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    submitCount: formState.submitCount,

    // Field states
    fieldStates,
    visibleFields: getVisibleFields(),

    // Handlers
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    getFieldState,

    // Utilities
    validateForm,
    validateField
  };
}

export default useDynamicForm;
