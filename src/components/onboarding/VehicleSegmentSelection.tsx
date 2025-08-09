import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

const PREDEFINED_SEGMENTS = [
  'Two Wheeler', 'Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury', 'Commercial (Light)', 'Commercial (Heavy)', 'Construction Equipment'
];

export default function VehicleSegmentSelection({ data, updateData }) {
  const [customSegment, setCustomSegment] = useState('');

  const handleSegmentToggle = (segment) => {
    const currentSegments = data.vehicleSegments || [];
    const newSegments = currentSegments.includes(segment)
      ? currentSegments.filter(s => s !== segment)
      : [...currentSegments, segment];
    updateData({ vehicleSegments: newSegments });
  };

  const handleAddCustomSegment = () => {
    if (customSegment.trim() && !(data.customSegments || []).includes(customSegment.trim())) {
      const newCustomSegments = [...(data.customSegments || []), customSegment.trim()];
      updateData({ customSegments: newCustomSegments });
      setCustomSegment('');
    }
  };
  
  const handleRemoveCustomSegment = (segmentToRemove) => {
      const newCustomSegments = (data.customSegments || []).filter(s => s !== segmentToRemove);
      updateData({ customSegments: newCustomSegments });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Select Your Vehicle Segments</AlertTitle>
        <AlertDescription>
          Choose the types of vehicles you typically handle. This helps in tailoring your marketplace experience.
        </AlertDescription>
      </Alert>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Predefined Segments</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PREDEFINED_SEGMENTS.map(segment => (
              <div key={segment} className="flex items-center space-x-2">
                <Checkbox
                  id={segment}
                  checked={(data.vehicleSegments || []).includes(segment)}
                  onCheckedChange={() => handleSegmentToggle(segment)}
                />
                <Label htmlFor={segment} className="cursor-pointer">{segment}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Custom Segments</h3>
          <div className="flex items-center gap-2">
            <Input
              placeholder="e.g., Vintage Cars"
              value={customSegment}
              onChange={(e) => setCustomSegment(e.target.value)}
            />
            <Button onClick={handleAddCustomSegment}><Plus className="w-4 h-4 mr-2" />Add</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(data.customSegments || []).map(segment => (
              <div key={segment} className="flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1 text-sm">
                <span>{segment}</span>
                <button onClick={() => handleRemoveCustomSegment(segment)} className="text-slate-500 hover:text-slate-800">
                    <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}