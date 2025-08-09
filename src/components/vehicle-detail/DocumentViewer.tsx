import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DocumentViewer({ asset }) {
  const [currentVersion, setCurrentVersion] = useState(asset.version_history?.length || 0);
  const hasHistory = asset.version_history && asset.version_history.length > 0;
  
  const allVersions = [...(asset.version_history || []), { url: asset.original_url, timestamp: asset.created_date, version: (asset.version_history?.length || 0) + 1 }];
  const displayedAsset = allVersions[currentVersion];

  const canGoBack = currentVersion > 0;
  const canGoForward = currentVersion < allVersions.length - 1;

  const getViewer = (url, mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return <img src={url} alt={asset.file_name} className="max-w-full max-h-[70vh] object-contain" />;
    }
    if (mimeType === 'application/pdf') {
      return <iframe src={url} className="w-full h-[70vh]" title={asset.file_name}></iframe>;
    }
    return <p>Cannot preview this file type. <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Download instead</a>.</p>;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="bg-slate-100 rounded-lg flex items-center justify-center p-4 min-h-[70vh]">
          {getViewer(displayedAsset.url, asset.mime_type)}
        </div>
        {hasHistory && (
          <div className="flex items-center justify-between mt-4">
            <Button size="sm" variant="outline" onClick={() => setCurrentVersion(p => p - 1)} disabled={!canGoBack}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <div className="text-sm text-slate-500">
              Version {displayedAsset.version} (Uploaded on {new Date(displayedAsset.timestamp).toLocaleDateString()})
            </div>
            <Button size="sm" variant="outline" onClick={() => setCurrentVersion(p => p + 1)} disabled={!canGoForward}>
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}