import React, { useState } from 'react';
import { Upload, Camera, Star, Trash2, Video, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { UploadFile } from '@/api/integrations';

// LST-009: AI Photo Suggestions
const AI_SUGGESTIONS = [
    "Front-right angle", "Dashboard & steering", "Rear seats", "Odometer reading", "Tire tread", "Engine bay"
];

export default function PhotosAndVideosStep({ data, updateData }) {
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (files) => {
        setUploading(true);
        try {
            const fileArray = Array.from(files || []);
            const uploads = await Promise.all(
                fileArray.map(async (file) => {
                    const result = await UploadFile({ file });
                    return result.file_url || result.url;
                })
            );
            const newImages = [...(data.images || []), ...uploads.filter(Boolean)];
            updateData({ images: newImages });

            if (!data.hero_image_url && newImages.length > 0) {
                updateData({ hero_image_url: newImages[0] });
            }
        } finally {
            setUploading(false);
        }
    };
    
    const setAsHero = (url) => {
        updateData({ hero_image_url: url });
    };

    const removeImage = (urlToRemove) => {
        const newImages = data.images.filter(url => url !== urlToRemove);
        updateData({ images: newImages });
        // If the removed image was the hero, set a new hero or clear it
        if (data.hero_image_url === urlToRemove) {
            updateData({ hero_image_url: newImages.length > 0 ? newImages[0] : '' });
        }
    };

  return (
    <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertTitle>Pro Tip: More Photos = More Trust</AlertTitle>
            <AlertDescription className="text-blue-700">
                Listings with 10+ high-quality photos get 3x more engagement. Ensure good lighting and show all angles.
            </AlertDescription>
        </Alert>

        <Card>
            <CardContent className="p-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-3">Drag & drop photos and videos here, or click to browse.</p>
                    <input type="file" multiple accept="image/*,video/*" onChange={(e) => handleFileUpload(e.target.files)} className="hidden" id="media-upload" />
                    <Button onClick={() => document.getElementById('media-upload').click()} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Choose Files'}
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        {data.images.length > 0 && (
            <div>
                <h3 className="font-semibold mb-2">Uploaded Photos ({data.images.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.images.map((url, index) => (
                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border">
                            <img src={url} alt={`upload-${index}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setAsHero(url)}>
                                    <Star className={`w-5 h-5 ${data.hero_image_url === url ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </Button>
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => removeImage(url)}>
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                            {data.hero_image_url === url && <div className="absolute bottom-1 right-1 bg-yellow-400 text-black text-xs px-1 rounded">HERO</div>}
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div>
            <h3 className="font-semibold mb-2">AI Photo Suggestions</h3>
            <div className="flex flex-wrap gap-2">
                {AI_SUGGESTIONS.map(suggestion => (
                    <Button key={suggestion} variant="outline" size="sm" className="bg-slate-100 cursor-default">
                        {suggestion}
                    </Button>
                ))}
            </div>
        </div>
    </div>
  );
}