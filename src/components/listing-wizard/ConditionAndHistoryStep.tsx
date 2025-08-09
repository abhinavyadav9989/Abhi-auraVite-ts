import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FileText, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConditionAndHistoryStep({ data, updateData }) {
  const [newRecord, setNewRecord] = useState({ date: '', kms: '', details: '' });

  const addServiceRecord = () => {
    if (newRecord.date && newRecord.details) {
      updateData({ service_history: [...(data.service_history || []), newRecord] });
      setNewRecord({ date: '', kms: '', details: '' });
    }
  };

  const removeServiceRecord = (index) => {
    const updatedHistory = [...data.service_history];
    updatedHistory.splice(index, 1);
    updateData({ service_history: updatedHistory });
  };
  
  const handleInspectionUpload = (file) => {
    // Mock upload. In a real app, this would use the UploadFile integration.
    const mockUrl = `https://aura.com/reports/${file.name}`;
    updateData({ inspection_report_url: mockUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="description">Vehicle Condition & Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Describe the vehicle's condition, highlighting any notable features, dents, scratches, or mechanical issues."
          rows={5}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.service_history && data.service_history.map((record, index) => (
            <div key={index} className="flex items-center gap-4 p-2 border rounded-md">
              <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                <span>Date: {record.date}</span>
                <span>KMs: {record.kms}</span>
                <span className="truncate">Details: {record.details}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeServiceRecord(index)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          <div className="flex items-end gap-2 p-2 border-dashed border-2 rounded-md">
            <div className="flex-1 space-y-1">
                <Label className="text-xs">Date</Label>
                <Input type="date" value={newRecord.date} onChange={(e) => setNewRecord({...newRecord, date: e.target.value})} />
            </div>
            <div className="flex-1 space-y-1">
                <Label className="text-xs">KMs</Label>
                <Input type="number" placeholder="e.g. 45000" value={newRecord.kms} onChange={(e) => setNewRecord({...newRecord, kms: e.target.value})} />
            </div>
            <div className="flex-1 space-y-1">
                <Label className="text-xs">Details</Label>
                <Input placeholder="e.g. Oil Change" value={newRecord.details} onChange={(e) => setNewRecord({...newRecord, details: e.target.value})} />
            </div>
            <Button onClick={addServiceRecord} size="icon"><Plus className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label>Inspection Report (Optional)</Label>
        {data.inspection_report_url ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-200">
                <FileText className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-800 truncate flex-1">{data.inspection_report_url.split('/').pop()}</p>
                <Button variant="ghost" size="sm" onClick={() => updateData({ inspection_report_url: '' })}>Remove</Button>
            </div>
        ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Upload a detailed inspection report (PDF)</p>
                <input type="file" accept=".pdf" onChange={(e) => handleInspectionUpload(e.target.files[0])} className="hidden" id="inspection-upload" />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('inspection-upload').click()}>
                    Choose File
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}