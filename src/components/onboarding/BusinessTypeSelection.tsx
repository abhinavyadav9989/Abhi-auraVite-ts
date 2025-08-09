import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Car, Repeat } from 'lucide-react';

const BUSINESS_TYPES = [
  { id: 'new', title: 'New Vehicles', icon: Sparkles, description: 'Primarily deal in brand new vehicles.' },
  { id: 'used', title: 'Used Vehicles', icon: Car, description: 'Primarily deal in pre-owned vehicles.' },
  { id: 'both', title: 'Both New & Used', icon: Repeat, description: 'Deal in both new and pre-owned markets.' },
];

export default function BusinessTypeSelection({ data, updateData }) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Select Your Business Model</AlertTitle>
        <AlertDescription>
          This determines which marketplaces you&apos;ll have access to by default.
        </AlertDescription>
      </Alert>
      <div className="grid md:grid-cols-3 gap-4">
        {BUSINESS_TYPES.map((type) => (
          <Card
            key={type.id}
            className={`text-center cursor-pointer transition-all hover:shadow-lg ${data.businessType === type.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-slate-300'}`}
            onClick={() => updateData({ businessType: type.id })}
          >
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <type.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">{type.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}