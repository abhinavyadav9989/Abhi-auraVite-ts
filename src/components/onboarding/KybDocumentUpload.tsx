
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Upload, FileText, CheckCircle, Clock, AlertTriangle, Shield } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { UploadFile } from "@/api/integrations";

const REQUIRED_DOCUMENTS = [
  { id: 'trade_licence', name: 'Trade Licence' },
  { id: 'gst_certificate', name: 'GST Certificate' },
  { id: 'pan_card', name: 'PAN Card (Business)' },
  { id: 'address_proof', name: 'Business Address Proof' },
  { id: 'cancelled_cheque', name: 'Cancelled Cheque' },
];

export default function KybDocumentUpload({ data, updateData }) {
  const { toast } = useToast();
  const [uploadingId, setUploadingId] = useState(null);

  const handleFileChange = async (docId, file) => {
    if (!file) return;

    setUploadingId(docId);
    try {
      const response = await UploadFile({ file });
      if (response.file_url) {
        updateData({
          kybDocuments: {
            ...data.kybDocuments,
            [docId]: {
              url: response.file_url,
              name: file.name,
              status: 'uploaded',
            },
          },
        });
        toast({ title: "Success", description: `${file.name} uploaded.` });
      } else {
        throw new Error("Upload failed to return a URL.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: `Could not upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploadingId(null);
    }
  };
  
  const getDocumentStatus = (docId) => {
    return data.kybDocuments?.[docId]?.status || 'pending';
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Business Verification (KYB)</AlertTitle>
        <AlertDescription>
          To ensure a secure marketplace, please upload the following documents. This is a one-time process.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const status = getDocumentStatus(doc.id);
          const uploadedFile = data.kybDocuments?.[doc.id];
          return (
            <Card key={doc.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-6 h-6 text-slate-500" />
                  <div>
                    <p className="font-semibold">{doc.name}</p>
                    {uploadedFile && (
                      <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        {uploadedFile.name}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {status === 'pending' && (
                     <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                  )}
                  {status === 'uploaded' && (
                     <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Uploaded</Badge>
                  )}
                   <Button asChild size="sm" variant="outline" disabled={uploadingId === doc.id}>
                    <label htmlFor={doc.id}>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingId === doc.id ? 'Uploading...' : 'Upload'}
                      <Input
                        id={doc.id}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(doc.id, e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Provisional Access</AlertTitle>
        <AlertDescription>
          You can choose to skip this step for now and complete it later to get provisional access. 
          However, you won&apos;t be able to publish listings until your documents are verified.
        </AlertDescription>
      </Alert>
    </div>
  );
}
