import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle, 
  AlertTriangle, 
  Edit, 
  ChevronDown, 
  Database, 
  FileText, 
  Car,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoFilledField {
  key: string;
  label: string;
  value: string | number | boolean;
  source: 'rto' | 'vin' | 'ocr' | 'manual' | 'suggestion';
  confidence?: number;
  validated?: boolean;
  editable?: boolean;
}

interface AutoFillDisplayProps {
  fields: AutoFilledField[];
  onEditField?: (key: string, value: any) => void;
  onValidateField?: (key: string) => void;
  title?: string;
  variant?: 'default' | 'compact' | 'inline';
  showSource?: boolean;
  showConfidence?: boolean;
  className?: string;
}

const getSourceIcon = (source: AutoFilledField['source']) => {
  switch (source) {
    case 'rto':
      return <Database className="w-4 h-4" />;
    case 'vin':
      return <Car className="w-4 h-4" />;
    case 'ocr':
      return <FileText className="w-4 h-4" />;
    case 'suggestion':
      return <Sparkles className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

const getSourceColor = (source: AutoFilledField['source']) => {
  switch (source) {
    case 'rto':
      return 'bg-blue-100 text-blue-800';
    case 'vin':
      return 'bg-green-100 text-green-800';
    case 'ocr':
      return 'bg-purple-100 text-purple-800';
    case 'suggestion':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getSourceLabel = (source: AutoFilledField['source']) => {
  switch (source) {
    case 'rto':
      return 'RTO Data';
    case 'vin':
      return 'VIN Decode';
    case 'ocr':
      return 'OCR Scan';
    case 'suggestion':
      return 'AI Suggestion';
    default:
      return 'Manual';
  }
};

const getConfidenceColor = (confidence?: number) => {
  if (!confidence) return 'text-gray-500';
  if (confidence >= 90) return 'text-green-600';
  if (confidence >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

export function AutoFillDisplay({
  fields,
  onEditField,
  onValidateField,
  title = 'Auto-Filled Fields',
  variant = 'default',
  showSource = true,
  showConfidence = true,
  className
}: AutoFillDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const validFields = fields.filter(field => field.value !== null && field.value !== undefined && field.value !== '');
  const hasValidFields = validFields.length > 0;

  if (!hasValidFields) {
    return null;
  }

  const handleEdit = (field: AutoFilledField) => {
    if (editingField === field.key) {
      setEditingField(null);
    } else {
      setEditingField(field.key);
    }
  };

  const handleSave = (field: AutoFilledField, newValue: any) => {
    onEditField?.(field.key, newValue);
    setEditingField(null);
  };

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {validFields.map((field) => (
          <div key={field.key} className="flex items-center gap-1 text-sm">
            <span className="font-medium">{field.label}:</span>
            <span className="text-gray-600">{String(field.value)}</span>
            {showSource && (
              <Badge variant="outline" className={cn('text-xs', getSourceColor(field.source))}>
                {getSourceIcon(field.source)}
                <span className="ml-1">{getSourceLabel(field.source)}</span>
              </Badge>
            )}
            {field.editable && onEditField && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(field)}
                className="h-6 w-6 p-0"
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('bg-blue-50 border-blue-200', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            {title} ({validFields.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {validFields.map((field) => (
              <div key={field.key} className="flex items-center gap-2 p-2 bg-white rounded border">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{field.label}</div>
                  <div className="text-gray-600 truncate">{String(field.value)}</div>
                </div>
                {showSource && (
                  <Badge variant="outline" className={cn('text-xs flex-shrink-0', getSourceColor(field.source))}>
                    {getSourceIcon(field.source)}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn('bg-blue-50 border-blue-200', className)}>
      <Collapsible open={showDetails} onOpenChange={() => setShowDetails(!showDetails)}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-blue-100 transition-colors">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                {title}
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {validFields.length} fields
                </Badge>
              </div>
              <ChevronDown className={cn(
                'w-4 h-4 transition-transform',
                showDetails && 'rotate-180'
              )} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="">
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {validFields.map((field) => (
                <div key={field.key} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{field.label}</span>
                        {field.validated && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {editingField === field.key ? (
                          <input
                            type="text"
                            defaultValue={String(field.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSave(field, e.currentTarget.value);
                              } else if (e.key === 'Escape') {
                                setEditingField(null);
                              }
                            }}
                            onBlur={(e) => handleSave(field, e.target.value)}
                            autoFocus
                          />
                        ) : (
                          String(field.value)
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {showSource && (
                          <Badge variant="outline" className={cn('text-xs', getSourceColor(field.source))}>
                            {getSourceIcon(field.source)}
                            <span className="ml-1">{getSourceLabel(field.source)}</span>
                          </Badge>
                        )}
                        
                        {showConfidence && field.confidence && (
                          <span className={cn('text-xs', getConfidenceColor(field.confidence))}>
                            {field.confidence}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {field.editable && onEditField && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(field)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {onValidateField && !field.validated && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onValidateField(field.key)}
                          className="h-8 w-8 p-0"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 bg-blue-100 p-2 rounded">
              <Info className="w-3 h-3 inline mr-1" />
              Auto-filled fields are suggestions based on available data. You can edit any field if needed.
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
