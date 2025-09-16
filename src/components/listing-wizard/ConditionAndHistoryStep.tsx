import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FileText, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadFile } from '@/api/integrations';

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
  
  const handleInspectionUpload = async (file: File | undefined) => {
    if (!file) return;
    const result = await UploadFile({ file });
    const url = result.file_url || result.url;
    if (!url) return;
    updateData({ inspection_report_url: url });
  };

  const handleRcUpload = async (file: File | undefined) => {
    if (!file) return;
    const result = await UploadFile({ file });
    const url = result.file_url || result.url;
    if (!url) return;
    const docs = Array.isArray(data.rc_docs) ? data.rc_docs : [];
    updateData({ rc_docs: [...docs, url] });
  };

  const handleInsuranceUpload = async (file: File | undefined) => {
    if (!file) return;
    const result = await UploadFile({ file });
    const url = result.file_url || result.url;
    if (!url) return;
    const docs = Array.isArray(data.insurance_docs) ? data.insurance_docs : [];
    updateData({ insurance_docs: [...docs, url] });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="description" className="dark:text-slate-200">Vehicle Condition & Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Describe the vehicle's condition, highlighting any notable features, dents, scratches, or mechanical issues."
          rows={5}
          className="min-h-[140px] dark:bg-[#0b1220] dark:border-slate-700 dark:text-slate-200"
        />
      </div>

      <Card className="dark:bg-[#0d1a2b] dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Service History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.service_history && data.service_history.map((record, index) => (
            <div key={index} className="flex items-center gap-4 p-2 border rounded-md dark:border-slate-700">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <span>Date: {record.date}</span>
                <span>KMs: {record.kms}</span>
                <span className="truncate">Details: {record.details}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeServiceRecord(index)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 border-dashed border-2 rounded-md dark:border-slate-700">
            <div className="sm:col-span-3 space-y-1">
                <Label className="text-xs dark:text-slate-300">Date</Label>
                <Input type="date" value={newRecord.date} onChange={(e) => setNewRecord({...newRecord, date: e.target.value})} className="dark:bg-[#0b1220] dark:border-slate-700 dark:text-slate-200" />
            </div>
            <div className="sm:col-span-3 space-y-1">
                <Label className="text-xs dark:text-slate-300">KMs</Label>
                <Input type="number" placeholder="e.g. 45000" value={newRecord.kms} onChange={(e) => setNewRecord({...newRecord, kms: e.target.value})} className="dark:bg-[#0b1220] dark:border-slate-700 dark:text-slate-200" />
            </div>
            <div className="sm:col-span-5 space-y-1">
                <Label className="text-xs dark:text-slate-300">Details</Label>
                <Input placeholder="e.g. Oil Change" value={newRecord.details} onChange={(e) => setNewRecord({...newRecord, details: e.target.value})} className="dark:bg-[#0b1220] dark:border-slate-700 dark:text-slate-200" />
            </div>
            <div className="sm:col-span-1 flex sm:items-end">
              <Button onClick={addServiceRecord} className="w-full sm:w-auto">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-[#0d1a2b] dark:border-slate-700">
        <CardHeader>
          <CardTitle>Basic Condition</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="tyres_ok" checked={!!data.tyres_ok} onCheckedChange={(v) => updateData({ tyres_ok: !!v })} />
            <Label htmlFor="tyres_ok" className="dark:text-slate-200">Tyres OK</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="brakes_ok" checked={!!data.brakes_ok} onCheckedChange={(v) => updateData({ brakes_ok: !!v })} />
            <Label htmlFor="brakes_ok" className="dark:text-slate-200">Brakes OK</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="flood_damage" checked={!!data.flood_damage} onCheckedChange={(v) => updateData({ flood_damage: !!v })} />
            <Label htmlFor="flood_damage" className="dark:text-slate-200">Flood Damage</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="accident_history" checked={!!data.accident_history} onCheckedChange={(v) => updateData({ accident_history: !!v })} />
            <Label htmlFor="accident_history" className="dark:text-slate-200">Accident History</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="structural_damage" checked={!!data.structural_damage} onCheckedChange={(v) => updateData({ structural_damage: !!v })} />
            <Label htmlFor="structural_damage" className="dark:text-slate-200">Structural Damage</Label>
          </div>
          <div>
            <Label className="dark:text-slate-200">Number of Keys</Label>
            <Input type="number" min={0} value={data.number_of_keys || ''} onChange={(e) => updateData({ number_of_keys: e.target.value ? Number(e.target.value) : '' })} />
          </div>
          <div>
            <Label className="dark:text-slate-200">Condition Rating (1-5)</Label>
            <Input type="number" min={1} max={5} value={data.condition_rating || ''} onChange={(e) => updateData({ condition_rating: e.target.value ? Number(e.target.value) : '' })} />
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-[#0d1a2b] dark:border-slate-700">
        <CardHeader>
          <CardTitle>Compliance Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="dark:text-slate-200">RC Document (image/pdf)</Label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center">
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleRcUpload(e.target.files?.[0])} className="hidden" id="rc-upload" />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('rc-upload')?.click()}>Upload RC</Button>
              {Array.isArray(data.rc_docs) && data.rc_docs.length > 0 && (
                <div className="mt-3 text-left space-y-2">
                  {data.rc_docs.map((url: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 underline break-all">{url.split('/').pop()}</a>
                      <Button variant="ghost" size="sm" onClick={() => updateData({ rc_docs: data.rc_docs.filter((u: string) => u !== url) })}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {data.insurance_available ? (
            <div>
              <Label className="dark:text-slate-200">Insurance Document (image/pdf)</Label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center">
                <input type="file" accept="image/*,.pdf" onChange={(e) => handleInsuranceUpload(e.target.files?.[0])} className="hidden" id="ins-upload" />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('ins-upload')?.click()}>Upload Insurance</Button>
                {Array.isArray(data.insurance_docs) && data.insurance_docs.length > 0 && (
                  <div className="mt-3 text-left space-y-2">
                    {data.insurance_docs.map((url: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 underline break-all">{url.split('/').pop()}</a>
                        <Button variant="ghost" size="sm" onClick={() => updateData({ insurance_docs: data.insurance_docs.filter((u: string) => u !== url) })}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Insurance not available.</div>
          )}
        </CardContent>
      </Card>

      <div>
        <Label className="dark:text-slate-200">Inspection Report (Optional)</Label>
        {data.inspection_report_url ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <FileText className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate flex-1">{data.inspection_report_url.split('/').pop()}</p>
                <Button variant="ghost" size="sm" onClick={() => updateData({ inspection_report_url: '' })}>Remove</Button>
            </div>
        ) : (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Upload a detailed inspection report (PDF)</p>
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