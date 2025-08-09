
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const ALL_CATEGORIES = [
    { id: 'two-wheeler', label: 'Two-Wheeler' },
    { id: 'three-wheeler', label: 'Three-Wheeler' },
    { id: 'hatchback', label: 'Hatchback' },
    { id: 'sedan', label: 'Sedan' },
    { id: 'suv', label: 'SUV' },
    { id: 'muv', label: 'MUV' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'electric', label: 'Electric' },
    { id: 'specialised', label: 'Specialised' },
    { id: 'service', label: 'Service' },
];

export default function AIVehicleDetailsStep({ data, updateData }) {
  const handleUpdate = (field, value) => {
    updateData({ [field]: value });
  };

  const handleCategoryChange = (categoryLabel, checked) => {
    const currentCategories = data.vehicle_category || [];
    const newCategories = checked
      ? [...currentCategories, categoryLabel]
      : currentCategories.filter(c => c !== categoryLabel);
    updateData({ vehicle_category: newCategories });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800">Verify Vehicle Details</h2>
        <p className="text-slate-500">
          Our AI has pre-filled these details. Please verify and correct them as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="make">Make</Label>
          <Input id="make" value={data.make || ''} onChange={e => handleUpdate('make', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input id="model" value={data.model || ''} onChange={e => handleUpdate('model', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="variant">Variant</Label>
          <Input id="variant" value={data.variant || ''} onChange={e => handleUpdate('variant', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input id="year" type="number" value={data.year || ''} onChange={e => handleUpdate('year', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="fuel_type">Fuel Type</Label>
          <Select value={data.fuel_type || ''} onValueChange={value => handleUpdate('fuel_type', value)}>
            <SelectTrigger id="fuel_type"><SelectValue placeholder="Select Fuel Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="cng">CNG</SelectItem>
              <SelectItem value="lpg">LPG</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="transmission">Transmission</Label>
          <Select value={data.transmission || ''} onValueChange={value => handleUpdate('transmission', value)}>
            <SelectTrigger id="transmission"><SelectValue placeholder="Select Transmission" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="amt">AMT</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <Label>Vehicle Categories</Label>
        <p className="text-sm text-slate-500">Select all categories that apply to this vehicle. This will determine what extra information is required.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_CATEGORIES.map(category => (
                <div key={category.id} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                    <Checkbox
                        id={`category-${category.id}`}
                        checked={(data.vehicle_category || []).includes(category.label)}
                        onCheckedChange={checked => handleCategoryChange(category.label, checked)}
                    />
                    <Label htmlFor={`category-${category.id}`} className="font-medium cursor-pointer">
                        {category.label}
                    </Label>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
