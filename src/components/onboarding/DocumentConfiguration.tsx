import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DEFAULT_DOCS = [
    { name: "Registration Certificate (RC)", type: 'rc', required: true, editable: false },
    { name: "Insurance", type: 'insurance', required: true, editable: false },
    { name: "Pollution Under Control (PUC)", type: 'puc', required: false, editable: true },
];

export default function DocumentConfiguration({ data, updateData }) {
    const [customDocName, setCustomDocName] = useState('');
    const documentRules = (data.documentValidationRules || {}) as Record<string, any>;

    const handleRequirementChange = (docType, isRequired) => {
        const newRules = {
            ...documentRules,
            [docType]: { ...documentRules[docType], required: isRequired }
        };
        updateData({ documentValidationRules: newRules });
    };

    const handleAddCustomDoc = () => {
        if (!customDocName.trim()) return;
        const docType = customDocName.trim().toLowerCase().replace(/\s+/g, '_');
        const newRules = {
            ...documentRules,
            [docType]: { name: customDocName.trim(), required: false, custom: true }
        };
        updateData({ documentValidationRules: newRules });
        setCustomDocName('');
    };

    const handleRemoveCustomDoc = (docType) => {
        const newRules = { ...documentRules };
        delete newRules[docType];
        updateData({ documentValidationRules: newRules });
    };

    const customDocEntries = (Object.entries(documentRules) as [string, any][])
        .filter(([_, rule]) => !!(rule && (rule as any).custom))
        .map(([type, rule]) => ({ ...(rule || {}), type, editable: true }));

    const allDocs = [
        ...DEFAULT_DOCS,
        ...customDocEntries
    ];
    // de-duplicate
    const uniqueDocs = allDocs.filter((doc, index, self) => index === self.findIndex(d => d.type === doc.type));

    return (
        <div className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Customer Document Requirements</AlertTitle>
                <AlertDescription>
                    As a Group Dealer, you can set which documents are mandatory for your sub-dealerships when they list vehicles.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Standard Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {uniqueDocs.filter(d => !d.custom).map(doc => (
                        <div key={doc.type} className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor={`req-${doc.type}`} className="font-medium">{doc.name}</Label>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500">Requirement:</span>
                                <Select
                                    value={documentRules[doc.type]?.required ?? doc.required ? 'required' : 'optional'}
                                    onValueChange={val => handleRequirementChange(doc.type, val === 'required')}
                                    disabled={!doc.editable}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="required">Required</SelectItem>
                                        <SelectItem value="optional">Optional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Custom Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Input 
                            placeholder="e.g., Service History" 
                            value={customDocName}
                            onChange={e => setCustomDocName(e.target.value)}
                        />
                        <Button onClick={handleAddCustomDoc}>
                            <Plus className="w-4 h-4 mr-2" /> Add Custom
                        </Button>
                    </div>
                    <div className="space-y-3">
                         {uniqueDocs.filter(d => d.custom).map(doc => (
                            <div key={doc.type} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                <span className="font-medium text-sm">{doc.name}</span>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveCustomDoc(doc.type)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                         ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}