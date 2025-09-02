import React, { useEffect, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { AttributeField, FieldDependency, DependencyEvaluationContext, DependencyEvaluationResult } from '@/types/attributeSets';
import FieldDependenciesService from '@/lib/fieldDependencies';

interface DynamicFieldProps {
  field: AttributeField;
  value: any;
  onChange: (fieldId: string, value: any) => void;
  onBlur?: (fieldId: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  dependencies?: FieldDependency[];
  context?: DependencyEvaluationContext;
  showMessages?: boolean;
}

interface FieldState {
  isVisible: boolean;
  isRequired: boolean;
  disabled: boolean;
  options: any[];
  className: string;
  messages: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

export default function DynamicField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  className = '',
  dependencies = [],
  context = { field_values: {} },
  showMessages = true
}: DynamicFieldProps) {
  const [fieldState, setFieldState] = useState<FieldState>({
    isVisible: field.isVisible,
    isRequired: field.isRequired,
    disabled: disabled,
    options: field.options || [],
    className: className,
    messages: []
  });

  // Evaluate dependencies when context changes
  useEffect(() => {
    if (dependencies.length === 0) return;

    const evaluationContext = {
      ...context,
      field_values: { ...context.field_values, [field.id]: value }
    };

    const results = FieldDependenciesService.evaluateDependencies(dependencies, evaluationContext);
    const result = results.get(field.id);

    if (result) {
      // Apply dependency actions
      const fieldDefinitions = new Map([[field.id, field]]);
      const updatedStates = FieldDependenciesService.applyActions(
        result.actions,
        new Map([[field.id, fieldState]]),
        fieldDefinitions
      );

      const newState = updatedStates.get(field.id) || fieldState;
      setFieldState(prevState => ({
        ...prevState,
        ...newState,
        messages: result.messages
      }));
    }
  }, [context, dependencies, value, field]);

  // Handle value changes
  const handleChange = (newValue: any) => {
    onChange(field.id, newValue);
  };

  const handleBlur = () => {
    onBlur?.(field.id);
  };

  // Don't render if field is hidden
  if (!fieldState.isVisible) {
    return null;
  }

  const fieldClassName = `${fieldState.className} ${className}`.trim();
  const isInvalid = !!error;
  const effectiveDisabled = fieldState.disabled || disabled;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            type="text"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={effectiveDisabled}
            className={fieldClassName}
          />
        );

      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleChange(Number(e.target.value) || 0)}
            onBlur={handleBlur}
            disabled={effectiveDisabled}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.precision ? 1 / Math.pow(10, field.precision) : 1}
            className={fieldClassName}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={effectiveDisabled}
            rows={4}
            className={fieldClassName}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={handleChange}
              disabled={effectiveDisabled}
            />
            <Label htmlFor={field.id} className="text-sm">
              {field.label}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={effectiveDisabled}
          >
            <SelectTrigger className={fieldClassName}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {fieldState.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                  {option.group && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {option.group}
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        // For now, implement as checkbox group
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{field.label}</Label>
            <div className="grid grid-cols-2 gap-2">
              {fieldState.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        handleChange([...currentValues, option.value]);
                      } else {
                        handleChange(currentValues.filter((v: any) => v !== option.value));
                      }
                    }}
                    disabled={effectiveDisabled}
                  />
                  <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={effectiveDisabled}
            className={fieldClassName}
          />
        );

      case 'file':
        return (
          <Input
            id={field.id}
            type="file"
            onChange={(e) => handleChange(e.target.files)}
            disabled={effectiveDisabled}
            className={fieldClassName}
            accept={field.validation?.pattern} // Use pattern for file types
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <Input
              id={field.id}
              type="range"
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              value={value || 50}
              onChange={(e) => handleChange(Number(e.target.value))}
              disabled={effectiveDisabled}
              className={fieldClassName}
            />
            <div className="text-sm text-gray-600">
              Value: {value || 50}
              {field.unit && ` ${field.unit}`}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-red-500 text-sm">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getMessageClass = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="space-y-2">
      {/* Field Label */}
      <div className="flex items-center gap-2">
        <Label
          htmlFor={field.id}
          className={`text-sm font-medium ${
            fieldState.isRequired ? 'text-gray-900' : 'text-gray-700'
          }`}
        >
          {field.label}
          {fieldState.isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {field.tooltip && (
          <div className="relative group">
            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {field.tooltip}
            </div>
          </div>
        )}

        {field.unit && (
          <Badge variant="outline" className="text-xs">
            {field.unit}
          </Badge>
        )}
      </div>

      {/* Field Input */}
      <div className={isInvalid ? 'space-y-1' : ''}>
        {renderField()}

        {/* Error Message */}
        {isInvalid && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>

      {/* Help Text */}
      {field.helpText && (
        <p className="text-xs text-gray-500">{field.helpText}</p>
      )}

      {/* Dependency Messages */}
      {showMessages && fieldState.messages.length > 0 && (
        <div className="space-y-2">
          {fieldState.messages.map((message, index) => (
            <Alert key={index} className={getMessageClass(message.type)}>
              {getMessageIcon(message.type)}
              <AlertDescription className="text-sm">
                {message.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Category Badge */}
      {field.category && (
        <Badge variant="secondary" className="text-xs">
          {field.category}
        </Badge>
      )}
    </div>
  );
}
