import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'lpg', label: 'LPG' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' }
];

const TRANSMISSION_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'amt', label: 'AMT' },
  { value: 'cvt', label: 'CVT' }
];

const OWNERSHIP_OPTIONS = [
  { value: 'first', label: 'First Owner' },
  { value: 'second', label: 'Second Owner' },
  { value: 'third', label: 'Third Owner' },
  { value: 'fourth_plus', label: 'Fourth+ Owner' }
];

const VEHICLE_TYPE_OPTIONS = [
  { value: 'personal', label: 'Personal Vehicle' },
  { value: 'commercial', label: 'Commercial Vehicle' }
];

export default function VehicleSpecs({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const renderCategorySpecificFields = () => {
    switch (data.vehicle_category) {
      case 'two_wheeler':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engine_cc">Engine Capacity (CC)</Label>
              <Input
                id="engine_cc"
                type="number"
                value={data.engine_cc || ''}
                onChange={(e) => handleChange('engine_cc', parseInt(e.target.value))}
                placeholder="e.g., 150"
              />
            </div>
          </div>
        );

      case 'three_wheeler':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seating_capacity">Seating Capacity</Label>
              <Select 
                value={data.seating_capacity?.toString() || ''} 
                onValueChange={(value) => handleChange('seating_capacity', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select seating capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Seater</SelectItem>
                  <SelectItem value="4">4 Seater</SelectItem>
                  <SelectItem value="6">6 Seater</SelectItem>
                  <SelectItem value="8">8 Seater</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'hatchback':
      case 'sedan':
      case 'suv':
      case 'muv':
      case 'luxury':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="airbags_count">Number of Airbags</Label>
              <Select 
                value={data.airbags_count?.toString() || ''} 
                onValueChange={(value) => handleChange('airbags_count', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select airbags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Airbags</SelectItem>
                  <SelectItem value="1">1 Airbag</SelectItem>
                  <SelectItem value="2">2 Airbags</SelectItem>
                  <SelectItem value="4">4 Airbags</SelectItem>
                  <SelectItem value="6">6 Airbags</SelectItem>
                  <SelectItem value="8">8+ Airbags</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'commercial_light':
      case 'commercial_heavy':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="load_capacity_tonnes">Load Capacity (Tonnes)</Label>
              <Input
                id="load_capacity_tonnes"
                type="number"
                step="0.1"
                value={data.load_capacity_tonnes || ''}
                onChange={(e) => handleChange('load_capacity_tonnes', parseFloat(e.target.value))}
                placeholder="e.g., 3.5"
              />
            </div>
          </div>
        );

      case 'tractor':
      case 'construction':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours_used">Hours Used</Label>
              <Input
                id="hours_used"
                type="number"
                value={data.hours_used || ''}
                onChange={(e) => handleChange('hours_used', parseInt(e.target.value))}
                placeholder="e.g., 2500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Select value={data.fuel_type || ''} onValueChange={(value) => handleChange('fuel_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map(fuel => (
                    <SelectItem key={fuel.value} value={fuel.value}>
                      {fuel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select value={data.transmission || ''} onValueChange={(value) => handleChange('transmission', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSMISSION_TYPES.map(trans => (
                    <SelectItem key={trans.value} value={trans.value}>
                      {trans.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select value={data.vehicle_type || ''} onValueChange={(value) => handleChange('vehicle_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPE_OPTIONS.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category-specific fields */}
          {renderCategorySpecificFields()}



          {/* Service-specific fields */}
          {data.inventory_type === 'service' && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  Service Information
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">Service</Badge>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="last_service_date">Last Service Date</Label>
                    <Input
                      id="last_service_date"
                      type="date"
                      value={data.last_service_date || ''}
                      onChange={(e) => handleChange('last_service_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="next_service_due_date">Next Service Due</Label>
                    <Input
                      id="next_service_due_date"
                      type="date"
                      value={data.next_service_due_date || ''}
                      onChange={(e) => handleChange('next_service_due_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}