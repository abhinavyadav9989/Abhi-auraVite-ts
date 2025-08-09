import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Building, Users, Car, Handshake, Briefcase, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CLIENT_TYPES = [
  { id: 'individual', title: 'Individual / Franchise', icon: Building, description: 'A single dealership location, new or used.' },
  { id: 'group_dealer', title: 'Group Dealer', icon: Users, description: 'Operate and manage multiple dealership locations.' },
  { id: 'dsa', title: 'Sales Agent (DSA)', icon: Handshake, description: 'Sell vehicles on behalf of other dealerships.' },
  { id: 'exclusive_buyer', title: 'Exclusive Buyer', icon: Briefcase, description: 'Source and purchase vehicles in bulk for your business.' },
  { id: 'self_user', title: 'Self-User', icon: Car, description: 'Browse and purchase vehicles for personal use.' },
  { id: 'partner', title: 'Service Partner', icon: UserCheck, description: 'Provide services like financing, insurance, or logistics.' },
];

export default function ClientTypeSelection({ data, updateData, errors }) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Select Your Business Type</AlertTitle>
        <AlertDescription>
          This helps us tailor the Aura platform to your specific needs, showing you the most relevant features and tools.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLIENT_TYPES.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${data.clientType === type.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-slate-300'}`}
            onClick={() => updateData({ clientType: type.id })}
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <type.icon className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-base font-semibold">{type.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {errors.clientType && <p className="text-sm text-red-600 text-center">{errors.clientType}</p>}

      {data.clientType === 'group_dealer' && (
        <Card className="mt-6 bg-slate-50 border-blue-200">
            <CardHeader>
                <CardTitle>Group Information</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                        id="groupName"
                        placeholder="e.g., National Auto Group"
                        value={data.groupName || ''}
                        onChange={(e) => updateData({ groupName: e.target.value })}
                        className={errors.groupName ? 'border-red-300' : ''}
                    />
                    {errors.groupName && <p className="text-sm text-red-600">{errors.groupName}</p>}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}