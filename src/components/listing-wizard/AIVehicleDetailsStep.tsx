
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
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Verify Vehicle Details</h2>
        <p className="text-slate-500 dark:text-slate-300">
          Our AI has pre-filled these details. Please verify and correct them as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="make" className="dark:text-slate-200">Make</Label>
          <Input id="make" value={data.make || ''} onChange={e => handleUpdate('make', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="model" className="dark:text-slate-2 00">Model</Label>
          <Input id="model" value={data.model || ''} onChange={e => handleUpdate('model', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="variant" className="dark:text-slate-200">Variant</Label>
          <Input id="variant" value={data.variant || ''} onChange={e => handleUpdate('variant', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="year" className="dark:text-slate-200">Year</Label>
          <Input id="year" type="number" value={data.year || ''} onChange={e => handleUpdate('year', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="fuel_type" className="dark:text-slate-200">Fuel Type</Label>
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
          <Label htmlFor="transmission" className="dark:text-slate-200">Transmission</Label>
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
        <div>
          <Label htmlFor="vehicle_type" className="dark:text-slate-200">Vehicle Type</Label>
          <Select value={data.vehicle_type || 'personal'} onValueChange={value => handleUpdate('vehicle_type', value)}>
            <SelectTrigger id="vehicle_type"><SelectValue placeholder="Select Vehicle Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal Vehicle</SelectItem>
              <SelectItem value="commercial">Commercial Vehicle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="kilometers" className="dark:text-slate-200">Kilometers Driven</Label>
          <Input 
            id="kilometers" 
            type="number" 
            placeholder="Enter kilometers driven"
            value={data.kilometers || ''} 
            onChange={e => handleUpdate('kilometers', e.target.value)} 
          />
        </div>
        <div>
          <Label htmlFor="color" className="dark:text-slate-200">Color</Label>
          <Input 
            id="color" 
            placeholder="Enter vehicle color"
            value={data.color || ''} 
            onChange={e => handleUpdate('color', e.target.value)} 
          />
        </div>
        <div>
          <Label htmlFor="ownership" className="dark:text-slate-200">Number of Owners</Label>
          <Select value={data.ownership || 'first'} onValueChange={value => handleUpdate('ownership', value)}>
            <SelectTrigger id="ownership"><SelectValue placeholder="Select Number of Owners" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="first">1st Owner</SelectItem>
              <SelectItem value="second">2nd Owner</SelectItem>
              <SelectItem value="third">3rd Owner</SelectItem>
              <SelectItem value="fourth">4th Owner</SelectItem>
              <SelectItem value="fifth">5th Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Label className="dark:text-slate-200">Vehicle Categories</Label>
        <p className="text-sm text-slate-500 dark:text-slate-300">Select all categories that apply to this vehicle. This will determine what extra information is required.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_CATEGORIES.map(category => (
                <div key={category.id} className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-white/5 border dark:border-slate-700 rounded-lg">
                    <Checkbox
                        id={`category-${category.id}`}
                        checked={(data.vehicle_category || []).includes(category.label)}
                        onCheckedChange={checked => handleCategoryChange(category.label, checked)}
                    />
                    <Label htmlFor={`category-${category.id}`} className="font-medium cursor-pointer dark:text-slate-200">
                        {category.label}
                    </Label>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
