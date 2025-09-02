import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Settings, Car, Gauge, Users, Palette } from 'lucide-react';

interface CoreSpecsStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
}

export default function CoreSpecsStep({ data, updateData, dealer }: CoreSpecsStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Predefined options
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
  const transmissionTypes = ['Manual', 'Automatic', 'CVT', 'AMT', 'DCT'];
  const bodyTypes = ['Sedan', 'Hatchback', 'SUV', 'MPV', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Van'];
  const ownershipOptions = ['1st Owner', '2nd Owner', '3rd Owner', '4th+ Owner'];
  const colors = [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 
    'Purple', 'Brown', 'Beige', 'Gold', 'Pink', 'Other'
  ];

  const handleFieldChange = (field: string, value: any) => {
    updateData({ [field]: value });
  };

  const renderField = (field: string, label: string, type: 'input' | 'select' | 'textarea', options?: string[], placeholder?: string) => {
    const value = data[field] || '';

    switch (type) {
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Select value={value} onValueChange={(val) => handleFieldChange(field, val)}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Textarea
              id={field}
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={placeholder}
              rows={3}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input
              id={field}
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={placeholder}
              type={field === 'kilometers' ? 'number' : 'text'}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Core Specifications</h2>
        <p className="text-gray-600">
          Provide the essential details about your vehicle. These will be visible to customers.
        </p>
      </div>

      {/* Essential Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Essential Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('fuel_type', 'Fuel Type', 'select', fuelTypes)}
            {renderField('transmission', 'Transmission', 'select', transmissionTypes)}
            {renderField('body_type', 'Body Type', 'select', bodyTypes)}
            {renderField('color', 'Color', 'select', colors)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('kilometers', 'Kilometers Driven', 'input', undefined, 'Enter kilometers')}
            {renderField('ownership', 'Number of Owners', 'select', ownershipOptions)}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Specifications */}
      <Collapsible open={showAdvanced} onOpenChange={() => setShowAdvanced(!showAdvanced)}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Advanced Specifications
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent className="">
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('engine_size', 'Engine Size', 'input', undefined, 'e.g., 1498 cc')}
                {renderField('seating_capacity', 'Seating Capacity', 'input', undefined, 'Number of seats')}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('rto_location', 'RTO Location', 'input', undefined, 'e.g., Mumbai')}
                {renderField('emission_norm', 'Emission Norm', 'input', undefined, 'e.g., BS6')}
              </div>

              <div>
                {renderField('description', 'Description', 'textarea', undefined, 'Add any additional details about the vehicle...')}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Branch Information (Read-only) */}
      {data.branch_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Branch Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Vehicle will be listed under: <span className="font-medium">{data.branch_name || 'Selected Branch'}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You can change this from the branch selection at the top
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-filled Fields Summary */}
      {data.auto_filled_fields && Object.keys(data.auto_filled_fields).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Auto-filled
              </Badge>
              Auto-filled Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(data.auto_filled_fields).map(([field, info]: [string, any]) => (
                <div key={field} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <Badge variant="outline" className="text-xs">
                    {info.source}
                  </Badge>
                  <span className="text-sm font-medium capitalize">
                    {field.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
