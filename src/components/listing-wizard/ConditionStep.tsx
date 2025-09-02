import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, CheckCircle, XCircle, AlertTriangle, Settings, Car, Wrench, FileText } from 'lucide-react';

interface ConditionStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
}

export default function ConditionStep({ data, updateData, dealer }: ConditionStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleConditionChange = (field: string, value: boolean) => {
    updateData({ [field]: value });
  };

  const handleNotesChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const renderConditionItem = (
    field: string, 
    label: string, 
    description: string,
    icon: React.ReactNode
  ) => {
    const value = data[field];
    const notesField = `${field}_notes`;
    const notes = data[notesField] || '';

    return (
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <Label className="text-base font-medium">{label}</Label>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={value === true}
              onCheckedChange={(checked) => handleConditionChange(field, checked)}
            />
            <Badge variant={value === true ? 'default' : 'secondary'}>
              {value === true ? 'Good' : 'Issue'}
            </Badge>
          </div>
        </div>
        
        {value === false && (
          <div className="mt-3">
            <Label htmlFor={notesField} className="text-sm font-medium">
              What's the issue?
            </Label>
            <Textarea
              id={notesField}
              value={notes}
              onChange={(e) => handleNotesChange(notesField, e.target.value)}
              placeholder={`Describe the ${label.toLowerCase()} issue...`}
              rows={2}
              className="mt-1"
            />
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedConditionItem = (
    field: string,
    label: string,
    type: 'number' | 'text' | 'select',
    unit?: string,
    options?: string[]
  ) => {
    const value = data[field] || '';

    return (
      <div className="space-y-2">
        <Label htmlFor={field} className="text-sm font-medium">
          {label}
        </Label>
        {type === 'select' ? (
          <select
            id={field}
            value={value}
            onChange={(e) => handleNotesChange(field, e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              id={field}
              value={value}
              onChange={(e) => handleNotesChange(field, e.target.value)}
              type={type}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Vehicle Condition</h2>
        <p className="text-gray-600">
          Assess the current condition of your vehicle. This helps set accurate expectations.
        </p>
      </div>

      {/* Basic Condition Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Basic Condition Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderConditionItem(
            'tyres_ok',
            'Tyres Condition',
            'Are all tyres in good condition with adequate tread?',
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          
          {renderConditionItem(
            'paint_ok',
            'Paint & Body',
            'Is the paint and body in good condition without major scratches?',
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          
          {renderConditionItem(
            'accident_history',
            'Accident History',
            'Has the vehicle been involved in any accidents?',
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          )}
          
          {renderConditionItem(
            'service_history_available',
            'Service History',
            'Do you have service records and maintenance history?',
            <FileText className="w-5 h-5 text-blue-600" />
          )}
        </CardContent>
      </Card>

      {/* General Condition Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Condition Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="condition_notes">Additional Condition Details</Label>
            <Textarea
              id="condition_notes"
              value={data.condition_notes || ''}
              onChange={(e) => handleNotesChange('condition_notes', e.target.value)}
              placeholder="Describe any other condition details, recent repairs, modifications, or special features..."
              rows={4}
            />
            <p className="text-sm text-gray-500">
              This information helps buyers understand the vehicle's current state
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Condition Assessment */}
      <Collapsible open={showAdvanced} onOpenChange={() => setShowAdvanced(!showAdvanced)}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Advanced Condition Assessment
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent className="">
            <CardContent className="space-y-4">
              <Alert>
                <Wrench className="w-4 h-4" />
                <AlertDescription>
                  These detailed measurements are optional and typically used for professional inspections.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderAdvancedConditionItem('tyre_tread_depth', 'Tyre Tread Depth', 'number', 'mm')}
                {renderAdvancedConditionItem('brake_pad_condition', 'Brake Pad Condition', 'select', undefined, ['Good', 'Fair', 'Needs Replacement'])}
                {renderAdvancedConditionItem('paint_thickness', 'Paint Thickness', 'number', 'microns')}
                {renderAdvancedConditionItem('engine_compression', 'Engine Compression', 'number', 'PSI')}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderAdvancedConditionItem('obd_codes', 'OBD Error Codes', 'text', undefined)}
                {renderAdvancedConditionItem('suspension_condition', 'Suspension Condition', 'select', undefined, ['Good', 'Fair', 'Needs Attention'])}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Condition Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Condition Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.entries(data).filter(([key, value]) => 
                  ['tyres_ok', 'paint_ok', 'service_history_available'].includes(key) && value === true
                ).length}
              </div>
              <div className="text-sm text-gray-600">Good</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Object.entries(data).filter(([key, value]) => 
                  ['tyres_ok', 'paint_ok', 'service_history_available'].includes(key) && value === false
                ).length}
              </div>
              <div className="text-sm text-gray-600">Issues</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {data.accident_history === false ? 1 : 0}
              </div>
              <div className="text-sm text-gray-600">Accidents</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.service_history_available === true ? 1 : 0}
              </div>
              <div className="text-sm text-gray-600">Service History</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
