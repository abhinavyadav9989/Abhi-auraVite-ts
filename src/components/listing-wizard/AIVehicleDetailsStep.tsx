
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
          <Select value={data.vehicle_type || 'personal'} onValueChange={value => {
            if (value !== 'commercial') {
              updateData({ vehicle_type: value, permit_type: null });
            } else {
              updateData({ vehicle_type: value });
            }
          }}>
            <SelectTrigger id="vehicle_type"><SelectValue placeholder="Select Vehicle Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal Vehicle</SelectItem>
              <SelectItem value="commercial">Commercial Vehicle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="dark:text-slate-200">Engine CC</Label>
          <Input type="number" min={1} value={data.engine_cc || ''} onChange={e => handleUpdate('engine_cc', e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <Label className="dark:text-slate-200">Drivetrain</Label>
          <Select value={data.drivetrain || ''} onValueChange={value => handleUpdate('drivetrain', value)}>
            <SelectTrigger><SelectValue placeholder="Select Drivetrain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fwd">FWD</SelectItem>
              <SelectItem value="rwd">RWD</SelectItem>
              <SelectItem value="awd">AWD</SelectItem>
              <SelectItem value="4wd">4WD</SelectItem>
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
          <Label className="dark:text-slate-200">Seating Capacity</Label>
          <Input type="number" min={1} value={data.seating_capacity || ''} onChange={e => handleUpdate('seating_capacity', e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <Label className="dark:text-slate-200">Airbags</Label>
          <Input type="number" min={0} value={data.airbags_count || ''} onChange={e => handleUpdate('airbags_count', e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <Label className="dark:text-slate-200">Registration Date</Label>
          <Input type="date" value={data.registration_date || ''} onChange={e => handleUpdate('registration_date', e.target.value || null)} />
        </div>
        <div>
          <Label className="dark:text-slate-200">RTO City</Label>
          <Input value={data.rto_location_city || ''} onChange={e => handleUpdate('rto_location_city', e.target.value)} />
        </div>
        <div>
          <Label className="dark:text-slate-200">RTO State</Label>
          <Input value={data.rto_location_state || ''} onChange={e => handleUpdate('rto_location_state', e.target.value)} />
        </div>
        <div>
          <Label className="dark:text-slate-200">Insurance Available</Label>
          <Select value={data.insurance_available ? 'yes' : 'no'} onValueChange={v => handleUpdate('insurance_available', v === 'yes')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {data.insurance_available && (
          <div>
            <Label className="dark:text-slate-200">Insurance Valid Until</Label>
            <Input type="date" value={data.insurance_valid_until || ''} onChange={e => handleUpdate('insurance_valid_until', e.target.value || null)} />
          </div>
        )}
        {data.vehicle_type === 'commercial' && (
          <div>
            <Label className="dark:text-slate-200">Permit Type</Label>
            <Select value={data.permit_type || ''} onValueChange={v => handleUpdate('permit_type', v)}>
              <SelectTrigger><SelectValue placeholder="Select Permit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_india">All India Permit</SelectItem>
                <SelectItem value="state">State Permit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
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
