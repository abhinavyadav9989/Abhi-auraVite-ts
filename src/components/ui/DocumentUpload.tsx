import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Eye, 
  Download,
  File,
  Image as ImageIcon,
  FileCheck,
  FileX,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentFile {
  id: string;
  name: string;
  type: 'rc' | 'insurance' | 'puc' | 'service' | 'other';
  file: File;
  url?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  ocrData?: any;
  extractedFields?: Record<string, any>;
  error?: string;
}

interface DocumentUploadProps {
  onFilesUploaded?: (files: DocumentFile[]) => void;
  onOcrComplete?: (fileId: string, data: any) => void;
  onFieldExtracted?: (fileId: string, field: string, value: any) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

const DOCUMENT_TYPES = [
  { id: 'rc', label: 'Registration Certificate', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  { id: 'insurance', label: 'Insurance Document', icon: FileCheck, color: 'bg-green-100 text-green-800' },
  { id: 'puc', label: 'PUC Certificate', icon: FileCheck, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'service', label: 'Service Records', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  { id: 'other', label: 'Other Documents', icon: File, color: 'bg-gray-100 text-gray-800' }
];

export function DocumentUpload({
  onFilesUploaded,
  onOcrComplete,
  onFieldExtracted,
  acceptedTypes = ['image/*', 'application/pdf'],
  maxFiles = 10,
  maxFileSize = 10, // 10MB
  className
}: DocumentUploadProps) {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = async (fileList: File[]) => {
    const newFiles: DocumentFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: 'other',
      file,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setUploading(true);

    // Simulate upload and OCR processing
    for (const file of newFiles) {
      await simulateUpload(file);
      await simulateOcrProcessing(file);
    }

    setUploading(false);
    onFilesUploaded?.(newFiles);
  };

  const simulateUpload = async (file: DocumentFile) => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, progress: i } : f
      ));
    }
    
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'processing' } : f
    ));
  };

  const simulateOcrProcessing = async (file: DocumentFile) => {
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR data based on file type
    const mockOcrData = getMockOcrData(file.name);
    
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { 
        ...f, 
        status: 'completed',
        ocrData: mockOcrData,
        extractedFields: mockOcrData.extractedFields
      } : f
    ));
    
    onOcrComplete?.(file.id, mockOcrData);
  };

  const getMockOcrData = (fileName: string) => {
    if (fileName.toLowerCase().includes('rc')) {
      return {
        documentType: 'rc',
        extractedFields: {
          registrationNumber: 'MH12AB1234',
          ownerName: 'John Doe',
          vehicleMake: 'Honda',
          vehicleModel: 'City',
          registrationDate: '2020-01-15',
          expiryDate: '2030-01-15'
        },
        confidence: 95
      };
    } else if (fileName.toLowerCase().includes('insurance')) {
      return {
        documentType: 'insurance',
        extractedFields: {
          policyNumber: 'INS123456789',
          insuranceCompany: 'ICICI Lombard',
          validFrom: '2024-01-01',
          validUntil: '2025-01-01',
          premiumAmount: '15000'
        },
        confidence: 88
      };
    } else if (fileName.toLowerCase().includes('puc')) {
      return {
        documentType: 'puc',
        extractedFields: {
          certificateNumber: 'PUC789012',
          validFrom: '2024-06-01',
          validUntil: '2024-12-01',
          emissionLevel: 'BS6'
        },
        confidence: 92
      };
    }
    
    return {
      documentType: 'unknown',
      extractedFields: {},
      confidence: 0
    };
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const getStatusIcon = (status: DocumentFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'processing':
        return <Sparkles className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: DocumentFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag & drop documents here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
              className="hidden"
              id="document-upload"
            />
            <Button onClick={() => document.getElementById('document-upload')?.click()} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Choose Files'}
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Supports JPG, PNG, PDF up to {maxFileSize}MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Types Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Supported Document Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DOCUMENT_TYPES.map(type => (
              <div key={type.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                <type.icon className="w-4 h-4" />
                <span>{type.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Uploaded Documents ({files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.name)}
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <span className={cn('text-sm font-medium', getStatusColor(file.status))}>
                            {file.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{file.name}</h4>
                        <p className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        
                        {/* Progress Bar */}
                        {file.status === 'uploading' && file.progress !== undefined && (
                          <div className="mt-2">
                            <Progress value={file.progress} className="w-full" />
                            <p className="text-xs text-gray-500 mt-1">
                              Uploading... {file.progress}%
                            </p>
                          </div>
                        )}
                        
                        {/* OCR Results */}
                        {file.status === 'completed' && file.extractedFields && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                OCR Processing Complete
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(file.extractedFields).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Apply extracted fields to form
                                  console.log('Apply extracted fields:', file.extractedFields);
                                }}
                              >
                                Apply to Form
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(URL.createObjectURL(file.file), '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* OCR Info */}
      <Alert>
        <Sparkles className="w-4 h-4" />
        <AlertDescription>
          Documents will be automatically processed using OCR to extract relevant information. 
          You can review and edit the extracted data before applying it to your form.
        </AlertDescription>
      </Alert>
    </div>
  );
}
