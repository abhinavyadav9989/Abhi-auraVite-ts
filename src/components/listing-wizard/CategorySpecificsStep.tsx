import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { 
  validateVehicleCategories, 
  validateCustomAttributes, 
  getCategoryRequiredFields,
  getAvailableCategories,
  getCategorySchema,
  ValidationErrors
} from '@/components/vehicle-safety/VehicleCategoryValidator';
import { ensureArray } from '@/components/formatters';

type CategorySpecificsProps = {
  data: any;
  updateData: (partial: any) => void;
};

type RequiredFieldConfig = {
  type: 'number' | 'select' | 'date' | 'text';
  min?: number;
  max?: number;
  maxLength?: number;
  options?: string[];
  required?: boolean;
  category?: string;
};

export default function CategorySpecificsStep({ data, updateData }: CategorySpecificsProps) {
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const availableCategories = getAvailableCategories();
  
  const handleCategoryToggle = (category: string) => {
    const currentCategories = ensureArray(data.vehicle_category);
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updateData({ vehicle_category: newCategories });
    
    // Validate categories
    const categoryValidation = validateVehicleCategories(newCategories);
    if (!categoryValidation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        categories: 'Please select at least one valid category'
      }));
    } else {
      setValidationErrors(prev => {
        const { categories, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleAttributeChange = (name: string, value: any) => {
    const newAttributes = {
      ...data.custom_attributes,
      [name]: value
    };
    
    updateData({ custom_attributes: newAttributes });
    
    // Validate custom attributes
    const attributeValidation = validateCustomAttributes(
      data.vehicle_category,
      newAttributes
    );
    
    if (!attributeValidation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        ...attributeValidation.errors
      }));
    } else {
      // Clear validation errors for this field
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const selectedCategories = ensureArray(data.vehicle_category);
  const requiredFields = getCategoryRequiredFields(selectedCategories);

  const renderFieldInput = (fieldName: string, fieldConfig: RequiredFieldConfig) => {
    const currentValue = data.custom_attributes?.[fieldName] || '';
    const hasError = validationErrors[fieldName];
    
    const commonProps = {
      id: fieldName,
      value: currentValue,
      onChange: (e) => handleAttributeChange(fieldName, e.target.value),
      className: hasError ? 'border-red-500' : ''
    };

    switch (fieldConfig.type) {
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={fieldConfig.min}
            max={fieldConfig.max}
            placeholder={`Enter ${fieldName.replace('_', ' ')}`}
          />
        );
        
      case 'select':
        return (
          <Select value={currentValue} onValueChange={(value) => handleAttributeChange(fieldName, value)}>
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={`Select ${fieldName.replace('_', ' ')}`} />
            </SelectTrigger>
            <SelectContent>
              {fieldConfig.options.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
          />
        );
        
      case 'text':
      default:
        return (
          <Input
            {...commonProps}
            type="text"
            maxLength={fieldConfig.maxLength}
            placeholder={`Enter ${fieldName.replace('_', ' ')}`}
          />
        );
    }
  };

  const getFieldLabel = (fieldName: string) => {
    return fieldName.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2 dark:text-white">Select Vehicle Categories</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">
          Choose one or more categories that apply. This helps buyers find your vehicle.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {availableCategories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryToggle(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedCategories.includes(category)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 border-slate-300 dark:border-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {validationErrors.categories && (
          <Alert className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationErrors.categories}</AlertDescription>
          </Alert>
        )}
      </div>

      {selectedCategories.length > 0 && Object.keys(requiredFields as Record<string, RequiredFieldConfig>).length > 0 && (
        <Card className="dark:bg-[#0d1a2b] dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Info className="w-5 h-5" />
              Category-Specific Details
            </CardTitle>
            <CardDescription className="dark:text-slate-300">
              Please provide the following details based on your selected categories:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.entries(requiredFields) as [string, RequiredFieldConfig][]).map(([fieldName, fieldConfig]) => (
              <div key={fieldName} className="space-y-2">
                <Label htmlFor={fieldName} className="flex items-center gap-2 dark:text-slate-200">
                  {getFieldLabel(fieldName)}
                  {fieldConfig.required && <span className="text-red-500">*</span>}
                  <Badge variant="secondary" className="text-xs">
                    {fieldConfig.category}
                  </Badge>
                </Label>
                {renderFieldInput(fieldName, fieldConfig)}
                {validationErrors[fieldName] && (
                  <p className="text-sm text-red-600">{validationErrors[fieldName]}</p>
                )}
              </div>
            ))}
            
            <ValidationErrors errors={validationErrors} className="mt-4" />
          </CardContent>
        </Card>
      )}

      {selectedCategories.length > 0 && Object.keys(requiredFields).length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Great! No additional details are required for the selected categories.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}