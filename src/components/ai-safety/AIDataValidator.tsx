import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, RefreshCw, Edit, Save, X } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { useToast } from '@/components/ui/use-toast';

// Known vehicle data validation rules
const VALIDATION_RULES = {
  make: {
    knownValues: [
      'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Ford', 'Chevrolet',
      'Renault', 'Nissan', 'Volkswagen', 'Skoda', 'BMW', 'Mercedes-Benz', 'Audi', 'Bajaj',
      'TVS', 'Hero', 'Royal Enfield', 'KTM', 'Yamaha', 'Suzuki', 'Kawasaki'
    ],
    fuzzyMatch: true
  },
  fuel_type: {
    knownValues: ['petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid'],
    strict: true
  },
  transmission: {
    knownValues: ['manual', 'automatic', 'amt', 'cvt'],
    strict: true
  },
  year: {
    min: 1990,
    max: new Date().getFullYear() + 1,
    type: 'number'
  }
};

const MODEL_COMPATIBILITY = {
  'Maruti Suzuki': ['Swift', 'Dzire', 'Alto', 'WagonR', 'Baleno', 'Vitara Brezza', 'Ertiga', 'XL6', 'S-Cross'],
  'Hyundai': ['i20', 'Verna', 'Creta', 'Venue', 'Grand i10', 'Santro', 'Tucson', 'Elantra'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Tigor', 'Punch'],
  'Honda': ['City', 'Amaze', 'WR-V', 'Jazz', 'CR-V', 'Civic'],
  'Toyota': ['Innova', 'Fortuner', 'Urban Cruiser', 'Glanza', 'Camry', 'Yaris']
  // Add more as needed
};

export default function AIDataValidator({ vehicleData, onDataUpdate, onValidationComplete }) {
  const [validationResults, setValidationResults] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isCorrectingWithAI, setIsCorrectingWithAI] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  const validateField = (fieldName, value) => {
    const rule = VALIDATION_RULES[fieldName];
    if (!rule) return { isValid: true };

    const validation = { isValid: true, warnings: [], suggestions: [] };

    // Type validation
    if (rule.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        validation.isValid = false;
        validation.error = `${fieldName} must be a number`;
        return validation;
      }
      
      if (rule.min && numValue < rule.min) {
        validation.isValid = false;
        validation.error = `${fieldName} must be at least ${rule.min}`;
        return validation;
      }
      
      if (rule.max && numValue > rule.max) {
        validation.isValid = false;
        validation.error = `${fieldName} cannot exceed ${rule.max}`;
        return validation;
      }
    }

    // Known values validation
    if (rule.knownValues) {
      const normalizedValue = value?.toLowerCase();
      const exactMatch = rule.knownValues.some(known => 
        known.toLowerCase() === normalizedValue
      );

      if (!exactMatch) {
        if (rule.strict) {
          validation.isValid = false;
          validation.error = `Invalid ${fieldName}. Must be one of: ${rule.knownValues.join(', ')}`;
          validation.suggestions = rule.knownValues;
        } else if (rule.fuzzyMatch) {
          // Find fuzzy matches
          const fuzzyMatches = rule.knownValues.filter(known =>
            known.toLowerCase().includes(normalizedValue) ||
            normalizedValue?.includes(known.toLowerCase())
          );
          
          if (fuzzyMatches.length > 0) {
            validation.warnings.push(`Did you mean: ${fuzzyMatches.join(', ')}?`);
            validation.suggestions = fuzzyMatches;
          } else {
            validation.warnings.push(`Unusual ${fieldName} value. Please verify.`);
          }
        }
      }
    }

    return validation;
  };

  const validateMakeModelCompatibility = (make, model) => {
    if (!make || !model) return { isValid: true };
    
    const compatibleModels = MODEL_COMPATIBILITY[make];
    if (!compatibleModels) return { isValid: true, warnings: [`Unknown make: ${make}`] };
    
    const isCompatible = compatibleModels.some(compatibleModel =>
      compatibleModel.toLowerCase() === model.toLowerCase() ||
      model.toLowerCase().includes(compatibleModel.toLowerCase()) ||
      compatibleModel.toLowerCase().includes(model.toLowerCase())
    );
    
    if (!isCompatible) {
      return {
        isValid: false,
        error: `${model} doesn't appear to be a ${make} model`,
        suggestions: compatibleModels.slice(0, 5) // Show top 5 suggestions
      };
    }
    
    return { isValid: true };
  };

  const runFullValidation = () => {
    setIsValidating(true);
    const results = {};

    // Validate individual fields
    Object.keys(VALIDATION_RULES).forEach(fieldName => {
      const value = vehicleData[fieldName];
      if (value) {
        results[fieldName] = validateField(fieldName, value);
      }
    });

    // Cross-field validation
    if (vehicleData.make && vehicleData.model) {
      const makeModelValidation = validateMakeModelCompatibility(vehicleData.make, vehicleData.model);
      if (!makeModelValidation.isValid) {
        results.make_model_compatibility = makeModelValidation;
      }
    }

    setValidationResults(results);
    setIsValidating(false);

    // Notify parent component
    const hasErrors = Object.values(results).some(result => !result.isValid);
    if (onValidationComplete) {
      onValidationComplete({ hasErrors, results });
    }

    if (hasErrors) {
      toast({
        title: "Validation Issues Found",
        description: "Please review and correct the highlighted issues.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Validation Passed",
        description: "All vehicle data looks good!"
      });
    }
  };

  const correctWithAI = async () => {
    setIsCorrectingWithAI(true);
    try {
      const response = await InvokeLLM({
        prompt: `
          Please validate and correct this vehicle data if needed:
          Make: ${vehicleData.make}
          Model: ${vehicleData.model}
          Year: ${vehicleData.year}
          Fuel Type: ${vehicleData.fuel_type}
          Transmission: ${vehicleData.transmission}
          
          Return only corrected data where you&apos;re confident of inaccuracies. Use standard Indian automotive terminology.
        `,
        response_json_schema: {
          type: "object",
          properties: {
            corrections_made: { type: "boolean" },
            corrected_data: {
              type: "object",
              properties: {
                make: { type: "string" },
                model: { type: "string" },
                year: { type: "number" },
                fuel_type: { type: "string" },
                transmission: { type: "string" }
              }
            },
            confidence_level: { type: "string", enum: ["high", "medium", "low"] },
            explanation: { type: "string" }
          }
        }
      });

      if (response.corrections_made && response.confidence_level === 'high') {
        onDataUpdate(response.corrected_data);
        toast({
          title: "AI Corrections Applied",
          description: response.explanation || "Vehicle data has been corrected."
        });
        
        // Re-run validation after correction
        setTimeout(runFullValidation, 500);
      } else {
        toast({
          title: "No Corrections Needed",
          description: "AI analysis suggests the current data is accurate."
        });
      }
    } catch (error) {
      toast({
        title: "AI Correction Failed",
        description: "Unable to get AI corrections. Please review manually.",
        variant: "destructive"
      });
    } finally {
      setIsCorrectingWithAI(false);
    }
  };

  const handleManualEdit = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setEditValue(currentValue || '');
  };

  const saveManualEdit = () => {
    if (editingField) {
      onDataUpdate({ [editingField]: editValue });
      setEditingField(null);
      setEditValue('');
      
      // Re-validate after edit
      setTimeout(runFullValidation, 500);
    }
  };

  const applySuggestion = (fieldName, suggestion) => {
    onDataUpdate({ [fieldName]: suggestion });
    
    // Re-validate after applying suggestion
    setTimeout(runFullValidation, 500);
  };

  const getFieldStatus = (fieldName) => {
    const result = validationResults[fieldName];
    if (!result) return 'unknown';
    if (!result.isValid) return 'error';
    if (result.warnings?.length > 0) return 'warning';
    return 'valid';
  };

  const renderFieldValidation = (fieldName, displayName) => {
    const result = validationResults[fieldName];
    const currentValue = vehicleData[fieldName];
    const status = getFieldStatus(fieldName);
    
    if (!result && !currentValue) return null;

    return (
      <div key={fieldName} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            {displayName}
            {status === 'valid' && <CheckCircle className="w-4 h-4 text-green-500" />}
            {status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
            {status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </Label>
          
          {editingField === fieldName ? (
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={saveManualEdit}>
                <Save className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handleManualEdit(fieldName, currentValue)}
            >
              <Edit className="w-3 h-3" />
            </Button>
          )}
        </div>

        {editingField === fieldName ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={`Enter ${displayName.toLowerCase()}`}
          />
        ) : (
          <div className={`p-2 rounded border ${
            status === 'error' ? 'border-red-300 bg-red-50' :
            status === 'warning' ? 'border-yellow-300 bg-yellow-50' :
            'border-green-300 bg-green-50'
          }`}>
            {currentValue || 'Not provided'}
          </div>
        )}

        {result?.error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}

        {result?.warnings?.map((warning, index) => (
          <Alert key={index} className="border-yellow-300 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        ))}

        {result?.suggestions?.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-slate-600">Suggestions:</span>
            <div className="flex flex-wrap gap-1">
              {result.suggestions.slice(0, 5).map((suggestion, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => applySuggestion(fieldName, suggestion)}
                  className="text-xs h-6"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Vehicle Data Validation</span>
          <div className="flex gap-2">
            <Button 
              onClick={runFullValidation} 
              disabled={isValidating}
              size="sm"
            >
              {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Validate'}
            </Button>
            <Button 
              onClick={correctWithAI} 
              disabled={isCorrectingWithAI}
              size="sm"
              variant="outline"
            >
              {isCorrectingWithAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'AI Correct'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(validationResults).length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Click &quot;Validate&quot; to check your vehicle data for accuracy.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {renderFieldValidation('make', 'Make')}
            {renderFieldValidation('model', 'Model')}
            {renderFieldValidation('year', 'Year')}
            {renderFieldValidation('fuel_type', 'Fuel Type')}
            {renderFieldValidation('transmission', 'Transmission')}
            
            {validationResults.make_model_compatibility && (
              <Alert className="border-red-300 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validationResults.make_model_compatibility.error}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}