import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VehicleAsset } from '@/api/entities';
import DocumentViewer from './DocumentViewer';
import { Upload, FileText, Trash2, Replace } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DOCUMENT_TYPES = [
  { id: 'rc', name: 'RC Copy' },
  { id: 'insurance', name: 'Insurance' },
  { id: 'puc', name: 'PUC Certificate' },
  { id: 'service_history', name: 'Service History' },
];

export default function DocumentsTab({ vehicleId }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, [vehicleId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const fetchedAssets = await VehicleAsset.filter({ vehicle_id: vehicleId, asset_type: 'document' });
              setDocuments((fetchedAssets as any[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (docType) => {
    // Mock upload
    toast({ title: `Uploading ${docType}...`, description: "This is a mock upload." });
  };
  
  const handleReplace = async (asset) => {
    // Mock replace
    const newVersion = (asset.version_history?.length || 0) + 2;
    toast({ title: `Replacing ${asset.file_name}`, description: `Creating Version ${newVersion}` });
  };

  const handleDelete = async (assetId) => {
    try {
      await VehicleAsset.delete(assetId);
      loadDocuments();
      toast({ title: "Document deleted." });
      if (selectedDoc?.id === assetId) {
        setSelectedDoc(null);
      }
    } catch (error) {
      toast({ title: "Error deleting document.", variant: "destructive" });
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Manage Documents</CardTitle>
            <CardDescription>Upload, view, and manage vehicle documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DOCUMENT_TYPES.map(docType => {
              const doc = documents.find(d => d.document_type === docType.id);
              return (
                <div key={docType.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{docType.name}</span>
                    {doc ? (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(doc)}>View</Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleReplace(doc)}><Replace className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(doc.id)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleUpload(docType.id)}>
                        <Upload className="w-3 h-3 mr-2" /> Upload
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        {selectedDoc ? (
          <DocumentViewer asset={selectedDoc} />
        ) : (
          <Card className="flex items-center justify-center min-h-[60vh] bg-slate-50">
            <div className="text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>Select a document to view its preview here.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}