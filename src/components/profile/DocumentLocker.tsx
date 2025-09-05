import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Clock, History, Trash2, Eye } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { DealerDocument } from '@/api/entities';
import { UploadFile } from '@/api/integrations';

export default function DocumentLocker({ documents = [], dealer, userRole, onDocumentUpdate, documentTypes = [] }) {
  const [uploading, setUploading] = useState(null);
  const { toast } = useToast();

  const handleFileUpload = async (file, docType) => {
    if (!file || !dealer?.id) {
      toast({ title: "Error", description: "Please select a valid file.", variant: "destructive" });
      return;
    }
    
    // Validate file type before upload
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({ 
        title: "Invalid File Type", 
        description: "Please upload images (JPEG, PNG, GIF, WebP) or documents (PDF, DOC, DOCX).", 
        variant: "destructive" 
      });
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({ 
        title: "File Too Large", 
        description: "File size must be less than 10MB.", 
        variant: "destructive" 
      });
      return;
    }
    
    setUploading(docType);

    try {
      // Upload to storage and persist permanent URL
      const { file_url, url, type } = await UploadFile({ file });
      
      // Debug: Log the uploaded file details
      console.log('File upload details:', {
        originalName: file.name,
        originalType: file.type,
        uploadedUrl: file_url || url,
        returnedType: type,
        fileSize: file.size
      });
      
      // Verify the uploaded file type matches the original
      if (type && type !== file.type) {
        console.warn(`File type mismatch: Original ${file.type}, Uploaded ${type}`);
      }
      
      const newDoc = {
        dealer_id: dealer.id,
        document_type: docType,
        file_url: file_url || url,
        file_name: file.name,
        file_size: file.size || 0, // Add fallback for size
        file_type: file.type, // Store the original file type
        status: 'pending'
      };

      // Check if a doc of this type exists and update it or create new
      const existingDoc = documents.find(d => d.document_type === docType);
      if (existingDoc) {
        await DealerDocument.update(existingDoc.id, newDoc);
      } else {
        await DealerDocument.create(newDoc);
      }

      toast({ title: "Success", description: `${file.name} uploaded successfully.` });
      if (onDocumentUpdate) {
        onDocumentUpdate(dealer.id); // Refresh documents
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({ 
        title: "Upload Failed", 
        description: error.message || "Failed to upload document. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setUploading(null);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      verified: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", text: "Verified" },
      pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", text: "Pending" },
      rejected: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", text: "Rejected" }
    };
    return configs[status] || configs.pending;
  };

  const canEdit = userRole === 'owner' || userRole === 'admin';
  const showUploadSlot = (docType) => {
    const doc = documents.find(d => d.document_type === docType);
    if (!doc) return true; // Always show if not uploaded
    // PF-08: Show if rejected or provisional
    return doc.status === 'rejected' || dealer?.verification_status === 'provisional';
  };

  if (!dealer) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-slate-500">Loading dealer information...</p>
      </div>
    );
  }

  // Debug: Log document URLs
  documents.forEach(doc => {
    console.log('Document file URL:', doc.file_url, 'for document:', doc.document_type);
  });

  console.log('DocumentLocker - Total documents:', documents.length);
  console.log('DocumentLocker - Document types:', documents.map(d => d.document_type));

  // Function to clear old Base44 documents and re-upload
  const clearOldDocuments = async () => {
    try {
      // Delete all existing documents for this dealer
      for (const doc of documents) {
        await DealerDocument.delete(doc.id);
      }
      
      toast({ 
        title: "Success", 
        description: "Old documents cleared. Please re-upload your documents." 
      });
      
      // Refresh documents list
      if (onDocumentUpdate) {
        onDocumentUpdate(dealer.id);
      }
    } catch (error) {
      console.error("Error clearing documents:", error);
      toast({ 
        title: "Error", 
        description: "Failed to clear old documents.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Locker
            </CardTitle>
            {documents.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearOldDocuments}
                className="text-red-600 hover:text-red-700"
              >
                Clear Old Documents
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {documentTypes.map(docTypeInfo => {
            const doc = documents.find(d => d.document_type === docTypeInfo.value);
            const statusConfig = doc ? getStatusConfig(doc.status) : null;
            const StatusIcon = statusConfig?.icon || Clock;

            return (
              <div key={docTypeInfo.value} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{docTypeInfo.label}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {docTypeInfo.required ? "Required for KYB verification" : "Optional document"}
                    </p>
                  </div>
                  {doc && (
                    <Badge className={`${statusConfig.bg} ${statusConfig.color} gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.text}
                    </Badge>
                  )}
                </div>

                {doc && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {doc.file_type?.startsWith('image/') ? (
                        <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-xs text-blue-600">IMG</span>
                        </div>
                      ) : (
                        <FileText className="w-5 h-5 text-slate-500"/>
                      )}
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.file_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {((doc.file_size || 0) / 1024).toFixed(1)} KB
                          {doc.file_type && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                              ({doc.file_type.split('/')[1]?.toUpperCase() || 'Unknown'})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            // For images, we can show them directly
                            if (doc.file_type?.startsWith('image/')) {
                              // Open in new tab for images
                              return;
                            }
                            // For PDFs and other documents, let the browser handle it
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.file_url} download={doc.file_name}>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                      {canEdit && <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                  </div>
                )}

                {showUploadSlot(docTypeInfo.value) && canEdit && (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <label className="cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600">
                        {uploading === docTypeInfo.value ? 'Uploading...' : `Click to upload ${doc ? 'new version' : ''}`}
                      </p>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, docTypeInfo.value);
                          }
                        }}
                        disabled={!!uploading}
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                        title="Accepted formats: PDF, JPEG, PNG, GIF, WebP, DOC, DOCX (Max 10MB)"
                      />
                    </label>
                  </div>
                )}
                
                {doc?.status === 'rejected' && doc.rejection_reason && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded-md">Reason: {doc.rejection_reason}</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}