import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DuplicateListingHelper from './DuplicateListingHelper';
import InfoTooltip from '@/components/ui/InfoTooltip';

const VEHICLE_CATEGORIES = [ "hatchback", "sedan", "suv", "muv", "luxury", "two_wheeler", "commercial_light", "commercial_heavy", "tractor", "construction"];
const INVENTORY_TYPES = [
  { value: "public", label: "Public", description: "Visible in the main marketplace for all dealers." },
  { value: "private", label: "Private", description: "Hidden from marketplace; for internal tracking or direct deals." },
  { value: "service", label: "Service", description: "For vehicles currently in your workshop; not for sale." },
  { value: "specialised", label: "Specialised", description: "For heavy machinery and unique equipment." },
];

export default function VehicleBasics({ data, onChange }) {
  const handleChange = (e) => {
    onChange({ [e.target.name]: e.target.value });
  };
  const handleSelectChange = (name, value) => {
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="inventory_type">Inventory Type</Label>
            <Select onValueChange={(value) => handleSelectChange('inventory_type', value)} value={data.inventory_type || 'public'}>
                <SelectTrigger id="inventory_type"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {INVENTORY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
                {INVENTORY_TYPES.find(t => t.value === (data.inventory_type || 'public'))?.description}
            </p>
        </div>
         <div className="space-y-2">
            <Label htmlFor="vehicle_category">Vehicle Category</Label>
            <Select onValueChange={(value) => handleSelectChange('vehicle_category', value)} value={data.vehicle_category || 'sedan'}>
                <SelectTrigger id="vehicle_category"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {VEHICLE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="capitalize">{cat.replace('_', ' ')}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="registration_number">
            Registration Number (e.g., MH01AB1234)
            <InfoTooltip>
                This is checked for duplicates. If a vehicle with this number exists, you&apos;ll be prompted.
            </InfoTooltip>
        </Label>
        <Input name="registration_number" id="registration_number" value={data.registration_number || ''} onChange={handleChange} className="uppercase" />
        <DuplicateListingHelper vehicles={[]} onDuplicate={() => {}} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="make">Make (e.g., Maruti Suzuki)</Label>
          <Input name="make" id="make" value={data.make || ''} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model (e.g., Swift)</Label>
          <Input name="model" id="model" value={data.model || ''} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}