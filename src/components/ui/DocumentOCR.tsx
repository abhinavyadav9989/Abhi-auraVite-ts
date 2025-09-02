import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, Eye, Download, RefreshCw } from 'lucide-react';
import { ocrService, OCRResult, OCRDocumentType } from '@/api/services/ocrService';

interface DocumentOCRProps {
  documentType: OCRDocumentType;
  onDataExtracted: (data: OCRResult['extracted_data']) => void;
  onUploadComplete?: (result: { file_url: string; file_name: string }) => void;
  existingValue?: string;
  label: string;
  placeholder?: string;
}

export function DocumentOCR({
  documentType,
  onDataExtracted,
  onUploadComplete,
  existingValue,
  label,
  placeholder = "Upload document for auto-fill"
}: DocumentOCRProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypeInfo = ocrService.getDocumentType(documentType);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP) or PDF document.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setOcrResult(null);

    // Auto-process the file
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Process with OCR
      const result = await ocrService.processDocument(file, {
        documentType,
        enhanceImage: true,
        validateData: true
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setOcrResult(result);

      if (result.success && result.confidence > 0.7) {
        // Auto-fill the extracted data
        onDataExtracted(result.extracted_data);

        // Notify about upload completion
        if (onUploadComplete) {
          onUploadComplete({
            file_url: '', // This would come from the upload result
            file_name: file.name
          });
        }
      }

    } catch (error) {
      console.error('OCR processing error:', error);
      setError('Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleViewResults = () => {
    if (ocrResult) {
      // In a real app, you might open a modal or expand a section
      console.log('OCR Results:', ocrResult);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High Confidence';
    if (confidence >= 0.7) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`document-${documentType}`}>
          {label}
          {documentTypeInfo && (
            <Badge variant="outline" className="ml-2 text-xs">
              OCR Enabled
            </Badge>
          )}
        </Label>

        <div className="flex gap-2">
          <Input
            id={`document-${documentType}`}
            value={existingValue || ''}
            placeholder={placeholder}
            readOnly
            className="flex-1"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {documentTypeInfo && (
          <p className="text-xs text-gray-500">
            {documentTypeInfo.description}. Upload for automatic data extraction.
          </p>
        )}
      </div>

      {/* Upload Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Processing document...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* OCR Results */}
      {ocrResult && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                OCR Results
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={getConfidenceColor(ocrResult.confidence)}
                >
                  {getConfidenceLabel(ocrResult.confidence)}
                </Badge>
                <span className="text-xs text-gray-500">
                  {Math.round(ocrResult.confidence * 100)}%
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {ocrResult.success ? (
              <>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Data extracted successfully
                </div>

                {/* Extracted Fields Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(ocrResult.extracted_data)
                    .filter(([key, value]) => value && key !== 'raw_text')
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded">
                        <div className="font-medium text-gray-700 capitalize">
                          {key.replace('_', ' ')}
                        </div>
                        <div className="text-gray-600 truncate">
                          {String(value)}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Warnings */}
                {ocrResult.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Review needed:</strong> {ocrResult.warnings.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewResults}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View Details
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetry}
                    disabled={isProcessing}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Re-process
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                Processing failed. Please try again or enter data manually.
              </div>
            )}

            <div className="text-xs text-gray-500 pt-2 border-t">
              Processing time: {ocrResult.processing_time}ms
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected File Info */}
      {selectedFile && !isProcessing && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="w-4 h-4" />
          <span>{selectedFile.name}</span>
          <span className="text-gray-400">
            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        </div>
      )}
    </div>
  );
}
