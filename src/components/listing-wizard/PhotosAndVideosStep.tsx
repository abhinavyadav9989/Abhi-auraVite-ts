import React, { useState } from 'react';
import { Upload, Camera, Star, Trash2, Video, Lightbulb, Mic } from 'lucide-react';
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

    const handleAudioUpload = async (files) => {
        setUploading(true);
        try {
            const fileArray = Array.from(files || []);
            const uploads = await Promise.all(
                fileArray.map(async (file) => {
                    const result = await UploadFile({ file });
                    return result.file_url || result.url;
                })
            );
            const newAudio = [...(data.audio || []), ...uploads.filter(Boolean)];
            updateData({ audio: newAudio });
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

    const removeAudio = (urlToRemove) => {
        const newAudio = (data.audio || []).filter((url) => url !== urlToRemove);
        updateData({ audio: newAudio });
    };

  return (
    <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            <AlertTitle className="dark:text-white">Pro Tip: More Photos = More Trust</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-200">
                Listings with 10+ high-quality photos get 3x more engagement. Ensure good lighting and show all angles.
            </AlertDescription>
        </Alert>

        <Card className="dark:bg-[#0d1a2b] dark:border-slate-700">
            <CardContent className="p-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Drag & drop photos and videos here, or click to browse.</p>
                    <input type="file" multiple accept="image/*,video/*" onChange={(e) => handleFileUpload(e.target.files)} className="hidden" id="media-upload" />
                    <Button onClick={() => document.getElementById('media-upload').click()} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Choose Files'}
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card className="dark:bg-[#0d1a2b] dark:border-slate-700">
            <CardContent className="p-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center">
                    <Mic className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Optional: upload engine sound (audio)</p>
                    <input type="file" multiple accept="audio/*" onChange={(e) => handleAudioUpload(e.target.files)} className="hidden" id="audio-upload" />
                    <Button variant="outline" onClick={() => document.getElementById('audio-upload').click()} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Audio'}
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        {Array.isArray(data.audio) && data.audio.length > 0 && (
            <div>
                <h3 className="font-semibold mb-2 dark:text-white">Uploaded Audio ({data.audio.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.audio.map((url, index) => (
                        <div key={index} className="p-3 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-white/5 flex items-center gap-3">
                            <audio controls src={url} className="flex-1" />
                            <Button size="icon" variant="ghost" onClick={() => removeAudio(url)}>
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {data.images.length > 0 && (
            <div>
                <h3 className="font-semibold mb-2 dark:text-white">Uploaded Photos ({data.images.length})</h3>
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
            <h3 className="font-semibold mb-2 dark:text-white">AI Photo Suggestions</h3>
            <div className="flex flex-wrap gap-2">
                {AI_SUGGESTIONS.map(suggestion => (
                    <Button key={suggestion} variant="outline" size="sm" className="bg-slate-100 dark:bg-white/5 dark:text-slate-200 dark:border-slate-700 cursor-default">
                        {suggestion}
                    </Button>
                ))}
            </div>
        </div>
    </div>
  );
}