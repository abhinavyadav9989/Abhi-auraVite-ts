import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Car } from 'lucide-react';

export default function RegistrationInputStep({ data, updateData }) {
  return (
    <div className="space-y-6 max-w-lg mx-auto text-center">
        <Alert>
            <Car className="h-4 w-4" />
            <AlertTitle>Start with the Registration Number</AlertTitle>
            <AlertDescription>
                We&apos;ll use the registration number to automatically fetch the vehicle&apos;s core details like make, model, and year, saving you time.
            </AlertDescription>
        </Alert>
        <div className="space-y-2">
            <Label htmlFor="registration_number" className="text-lg font-semibold">Enter Vehicle Registration Number</Label>
            <Input
                id="registration_number"
                value={data.registration_number}
                onChange={(e) => updateData({ registration_number: e.target.value.toUpperCase().replace(/\s/g, '') })}
                placeholder="e.g., MH12AB1234"
                className="text-center text-xl h-14"
            />
        </div>
    </div>
  );
}