import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Upload } from 'lucide-react';

export default function GroupDealerDetails({ data, updateData }) {
  const [newOrg, setNewOrg] = useState({ name: '', email: '', gstin: '', pan: '' });

  const addOrganization = () => {
    if (newOrg.name && newOrg.email) {
      updateData({ organizations: [...data.organizations, newOrg] });
      setNewOrg({ name: '', email: '', gstin: '', pan: '' });
    }
  };

  const removeOrganization = (index) => {
    const updatedOrgs = data.organizations.filter((_, i) => i !== index);
    updateData({ organizations: updatedOrgs });
  };
  
  const handleCSVUpload = (event) => {
    // Implement CSV parsing and update logic here
    alert("CSV upload functionality would be implemented here.");
  };

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
         <h3 className="text-lg font-semibold">Add Organizations to Group</h3>
         <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Bulk Upload CSV</Button>
      </div>

      {data.organizations.map((org, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{org.name}</p>
              <p className="text-sm text-slate-500">{org.email}</p>
              <p className="text-xs text-slate-400">GST: {org.gstin || 'N/A'} | PAN: {org.pan || 'N/A'}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeOrganization(index)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </Card>
      ))}

      <Card className="p-4 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Organization Name" value={newOrg.name} onChange={e => setNewOrg({...newOrg, name: e.target.value})} />
          <Input placeholder="Contact Email" value={newOrg.email} onChange={e => setNewOrg({...newOrg, email: e.target.value})} />
          <Input placeholder="GSTIN (Optional)" value={newOrg.gstin} onChange={e => setNewOrg({...newOrg, gstin: e.target.value})} />
          <Input placeholder="PAN (Optional)" value={newOrg.pan} onChange={e => setNewOrg({...newOrg, pan: e.target.value})} />
        </div>
        <Button onClick={addOrganization} className="mt-4"><Plus className="w-4 h-4 mr-2" /> Add Organization</Button>
      </Card>
    </div>
  );
}