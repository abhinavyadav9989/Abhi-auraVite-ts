import React, { useState, useEffect } from 'react';
import { VehicleAsset } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import {
  Upload,
  FileText,
  Image,
  Video,
  Camera,
  Download,
  Eye,
  Trash2,
  History,
  MoreVertical,
  Lock,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { UploadFile } from '@/api/integrations';

const DOCUMENT_TYPES = [
  { value: 'rc', label: 'Registration Certificate', icon: FileText },
  { value: 'insurance', label: 'Insurance Policy', icon: FileText },
  { value: 'puc', label: 'PUC Certificate', icon: FileText },
  { value: 'service_history', label: 'Service History', icon: FileText },
  { value: 'other', label: 'Other Document', icon: FileText }
];

const ASSET_TYPES = [
  { value: 'image', label: 'Photos', icon: Image },
  { value: 'document', label: 'Documents', icon: FileText },
  { value: '360_spin', label: '360° View', icon: Camera },
  { value: 'video_reel', label: 'Video Reel', icon: Video }
];

export default function AssetsTab({ vehicleId }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAssets();
  }, [vehicleId]);

  const loadAssets = async () => {
    try {
      // Mock asset data - in real app, this would fetch from VehicleAsset entity
      const mockAssets = [
        {
          id: '1',
          vehicle_id: vehicleId,
          asset_type: 'image',
          file_url: 'https://images.unsplash.com/photo-1549824024-0b70d52ba35d?w=800',
          status: 'ready',
          is_hero: true,
          order_index: 0,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          vehicle_id: vehicleId,
          asset_type: 'document',
          document_type: 'rc',
          file_url: '/mock-rc.pdf',
          status: 'ready',
          file_name: 'RC_Certificate.pdf',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          version_history: [
            { version: 1, url: '/mock-rc-v1.pdf', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
            { version: 2, url: '/mock-rc.pdf', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
          ]
        },
        {
          id: '3',
          vehicle_id: vehicleId,
          asset_type: '360_spin',
          file_url: '/mock-360.mp4',
          status: 'processing',
          created_at: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: '4',
          vehicle_id: vehicleId,
          asset_type: 'document',
          document_type: 'insurance',
          file_url: '/mock-insurance.pdf',
          status: 'failed',
          file_name: 'Insurance_Policy.pdf',
          created_at: new Date(Date.now() - 60 * 60 * 1000)
        }
      ];
      
      setAssets(mockAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
      toast({ title: 'Error', description: 'Failed to load assets.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (files, assetType, documentType = null) => {
    setUploading(true);
    
    try {
      for (const file of files) {
        const uploadResult = await UploadFile({ file });
        
        const newAsset = {
          vehicle_id: vehicleId,
          asset_type: assetType,
          document_type: documentType,
          file_url: uploadResult.file_url,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: 'processing',
          order_index: assets.length
        };

        // Mock creation - in real app, use VehicleAsset.create()
        const createdAsset: any = await new Promise<any>(resolve => {
          setTimeout(() => {
            resolve({ ...newAsset, id: Date.now().toString(), created_at: new Date() });
          }, 1000);
        });

        setAssets(prev => [...prev, createdAsset]);
        
        // Simulate processing completion
        setTimeout(() => {
          setAssets(prev => prev.map(asset => 
            asset.id === createdAsset.id 
              ? { ...asset, status: 'ready' }
              : asset
          ));
        }, 3000);
      }
      
      toast({ title: 'Upload Started', description: 'Files are being processed.' });
    } catch (error) {
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    }
    
    setUploading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      default: return 'Pending';
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      // Mock deletion - in real app, use VehicleAsset.delete()
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      toast({ title: 'Asset Deleted', description: 'Asset has been removed.' });
    } catch (error) {
      toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleDownload = (asset) => {
    // Mock download - in real app, this would trigger actual file download
    const link = document.createElement('a');
            link.href = asset.file_url;
    link.download = asset.file_name || `asset_${asset.id}`;
    link.click();
    
    toast({ title: 'Download Started', description: `Downloading ${asset.file_name}` });
  };

  const renderAssetCard = (asset: any) => {
    const AssetIcon = ASSET_TYPES.find(type => type.value === asset.asset_type)?.icon || FileText;
    
    return (
      <Card key={asset.id} className="relative">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <AssetIcon className="w-5 h-5 text-slate-500" />
              <div>
                <p className="font-medium text-sm">
                  {asset.asset_type === 'document' 
                    ? DOCUMENT_TYPES.find(dt => dt.value === asset.document_type)?.label || 'Document'
                    : ASSET_TYPES.find(at => at.value === asset.asset_type)?.label
                  }
                </p>
                {asset.file_name && (
                  <p className="text-xs text-slate-500">{asset.file_name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(asset.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedAsset(asset)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload(asset)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  {asset.version_history && asset.version_history.length > 1 && (
                    <DropdownMenuItem onClick={() => {
                      setSelectedAsset(asset);
                      setShowVersionHistory(true);
                    }}>
                      <History className="w-4 h-4 mr-2" />
                      Version History
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={
              asset.status === 'ready' ? 'bg-green-50 text-green-700' :
              asset.status === 'processing' ? 'bg-blue-50 text-blue-700' :
              asset.status === 'failed' ? 'bg-red-50 text-red-700' :
              'bg-gray-50 text-gray-700'
            }>
              {getStatusText(asset.status)}
            </Badge>
            
            {asset.status === 'processing' && (
              <div className="w-16">
                <Progress value={65} className="h-1" />
              </div>
            )}
          </div>
          
          {asset.is_hero && (
            <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs">
              Hero
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading assets...</div>;
  }

  const groupedAssets = ASSET_TYPES.reduce<Record<string, any[]>>((acc, type) => {
    acc[type.value] = assets.filter((asset: any) => asset.asset_type === type.value);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {/* DG-DOC-01: Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Documents are encrypted and only accessible to admins and vehicle owners
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Upload Sections */}
      {ASSET_TYPES.map(assetType => {
        const AssetIcon = assetType.icon;
        const assetList = groupedAssets[assetType.value] || [];
        
        return (
          <Card key={assetType.value}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AssetIcon className="w-5 h-5" />
                {assetType.label}
                <Badge variant="outline">{assetList.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Drag and drop {assetType.label.toLowerCase()} here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple={assetType.value === 'image'}
                    accept={
                      assetType.value === 'image' ? 'image/*' :
                      assetType.value === 'document' ? '.pdf,.jpg,.jpeg,.png' :
                      assetType.value === 'video_reel' ? 'video/*' : '*/*'
                    }
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 0) {
                        handleFileUpload(files, assetType.value);
                      }
                    }}
                    className="hidden"
                    id={`upload-${assetType.value}`}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById(`upload-${assetType.value}`).click()}
                    disabled={uploading}
                  >
                    Choose Files
                  </Button>
                </div>

                {/* Asset Grid */}
                {assetList.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assetList.map(renderAssetCard)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Asset Preview Modal */}
      {selectedAsset && !showVersionHistory && (
        <Dialog open={true} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                {selectedAsset.file_name || 
                 (selectedAsset.asset_type === 'document' 
                   ? DOCUMENT_TYPES.find(dt => dt.value === selectedAsset.document_type)?.label 
                   : ASSET_TYPES.find(at => at.value === selectedAsset.asset_type)?.label)
                }
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex items-center justify-center bg-slate-100 rounded-lg">
              {selectedAsset.asset_type === 'image' ? (
                <img 
                  src={selectedAsset.file_url} 
                  alt="Asset preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedAsset.asset_type === 'document' ? (
                <div className="w-full h-full">
                  <iframe 
                    src={selectedAsset.file_url + '#toolbar=1'}
                    className="w-full h-full border-0"
                    title="Document preview"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600">Preview not available for this file type</p>
                  <Button 
                    onClick={() => handleDownload(selectedAsset)}
                    className="mt-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Version History Modal */}
      {selectedAsset && showVersionHistory && (
        <Dialog open={true} onOpenChange={() => {
          setShowVersionHistory(false);
          setSelectedAsset(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Version History - {selectedAsset.file_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {selectedAsset.version_history?.map((version, index) => (
                <div key={version.version} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Version {version.version}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(version.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    {index !== 0 && (
                      <Button size="sm" variant="outline">
                        Revert
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}