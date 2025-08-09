import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Globe, Lock, Wrench, Calendar, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const INVENTORY_TYPES = [
    { id: 'public', title: 'Public', description: 'Visible to all dealers on the marketplace.', icon: Globe },
    { id: 'private', title: 'Private', description: 'Visible only to your trusted network or via direct link.', icon: Lock },
    { id: 'service', title: 'Service', description: 'For vehicles undergoing refurbishment. Not for sale.', icon: Wrench },
];

export default function PublishSettingsStep({ data, updateData }) {
  return (
    <div className="space-y-6">
        <div>
            <Label className="text-base font-semibold">Inventory Type</Label>
            <p className="text-sm text-slate-600 mb-4">Choose who can see and interact with this listing.</p>
            <RadioGroup
                value={data.inventory_type}
                onValueChange={(value) => updateData({ inventory_type: value })}
                className="grid md:grid-cols-3 gap-4"
            >
                {INVENTORY_TYPES.map((type) => (
                    <Label key={type.id} htmlFor={type.id} className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer hover:bg-slate-50 ${data.inventory_type === type.id ? 'border-blue-500' : ''}`}>
                         <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                         <type.icon className="w-8 h-8 mb-2" />
                         <span className="font-bold">{type.title}</span>
                         <span className="text-xs text-center text-slate-500">{type.description}</span>
                    </Label>
                ))}
            </RadioGroup>
        </div>
        
        <div className="space-y-3">
             <Label htmlFor="publish_at" className="text-base font-semibold">Schedule Listing (Optional)</Label>
             <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Leave blank to publish immediately after review. Otherwise, select a future date and time for the listing to go live automatically.
                </AlertDescription>
             </Alert>
             <div className="relative max-w-sm">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    id="publish_at"
                    type="datetime-local"
                    value={data.publish_at || ''}
                    onChange={(e) => updateData({ publish_at: e.target.value })}
                    className="pl-8"
                />
            </div>
        </div>
    </div>
  );
}