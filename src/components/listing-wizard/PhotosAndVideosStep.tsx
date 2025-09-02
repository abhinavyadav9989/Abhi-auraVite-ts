import React, { useState, useCallback } from 'react';
import { Upload, Camera, Star, Trash2, Video, Lightbulb, Eye, Download, Move, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UploadFile } from '@/api/integrations';

interface PhotosAndVideosStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
}

// AI Photo Suggestions for better listings
const AI_SUGGESTIONS = [
  { id: 'front_right', label: 'Front-right angle', icon: '🚗' },
  { id: 'dashboard', label: 'Dashboard & steering', icon: '🎛️' },
  { id: 'rear_seats', label: 'Rear seats', icon: '💺' },
  { id: 'odometer', label: 'Odometer reading', icon: '📊' },
  { id: 'tire_tread', label: 'Tire tread', icon: '🛞' },
  { id: 'engine_bay', label: 'Engine bay', icon: '🔧' },
  { id: 'interior', label: 'Interior overview', icon: '🏠' },
  { id: 'exterior', label: 'Exterior overview', icon: '🌅' }
];

// Quality tips for better photos
const QUALITY_TIPS = [
  'Use natural daylight for best results',
  'Take photos from multiple angles',
  'Include close-ups of any damage',
  'Show the odometer clearly',
  'Capture the interior condition'
];

export default function PhotosAndVideosStep({ data, updateData, dealer }: PhotosAndVideosStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileArray = Array.from(files);
      const totalFiles = fileArray.length;
      let completedFiles = 0;

      const uploads = await Promise.all(
        fileArray.map(async (file) => {
          const result = await UploadFile({ file });
          completedFiles++;
          setUploadProgress((completedFiles / totalFiles) * 100);
          return result.file_url || result.url;
        })
      );

      const newImages = [...(data.images || []), ...uploads.filter(Boolean)];
      updateData({ images: newImages });

      // Set hero image if none exists
      if (!data.hero_image_url && newImages.length > 0) {
        updateData({ hero_image_url: newImages[0] });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [data.images, data.hero_image_url, updateData]);

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
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const setAsHero = (url: string) => {
    updateData({ hero_image_url: url });
  };

  const removeImage = (urlToRemove: string) => {
    const newImages = data.images.filter((url: string) => url !== urlToRemove);
    updateData({ images: newImages });
    
    // If the removed image was the hero, set a new hero or clear it
    if (data.hero_image_url === urlToRemove) {
      updateData({ hero_image_url: newImages.length > 0 ? newImages[0] : '' });
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...data.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    updateData({ images: newImages });
    
    // Update hero image if it was moved
    if (data.hero_image_url === movedImage) {
      updateData({ hero_image_url: newImages[0] });
    }
  };

  const getImageStats = () => {
    const totalImages = data.images?.length || 0;
    const hasHero = !!data.hero_image_url;
    const hasVideos = data.videos?.length > 0;
    
    return { totalImages, hasHero, hasVideos };
  };

  const stats = getImageStats();

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Photos & Videos</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Upload high-quality photos and videos to showcase your vehicle. The first photo will be the cover image.
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <Card className="mx-4 md:mx-0">
          <CardContent className="p-3 md:p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span>Uploading media...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full h-2 md:h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pro Tip */}
      <Alert className="bg-blue-50 border-blue-200 mx-4 md:mx-0 py-3">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-sm md:text-base">Pro Tip: More Photos = More Trust</AlertTitle>
        <AlertDescription className="text-blue-700 text-sm">
          Listings with 10+ high-quality photos get 3x more engagement. Ensure good lighting and show all angles.
        </AlertDescription>
      </Alert>

      {/* Upload Area */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Upload className="w-4 h-4 md:w-5 md:h-5" />
            Upload Media
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div
            className={`border-2 border-dashed rounded-lg p-4 md:p-8 text-center transition-colors touch-manipulation ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-700 mb-2">
              Drag & drop photos and videos here
            </p>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="media-upload"
            />
            <Button
              onClick={() => document.getElementById('media-upload')?.click()}
              disabled={uploading}
              className="text-sm md:text-base py-2 px-4"
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </Button>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Supports JPG, PNG, MP4 up to 50MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Media Stats */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Media Summary</CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.totalImages}</div>
              <div className="text-xs md:text-sm text-gray-600">Photos</div>
            </div>
            <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.hasHero ? 1 : 0}</div>
              <div className="text-xs md:text-sm text-gray-600">Cover Image</div>
            </div>
            <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-purple-600">{stats.hasVideos ? data.videos?.length || 0 : 0}</div>
              <div className="text-xs md:text-sm text-gray-600">Videos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Media */}
      {data.images && data.images.length > 0 && (
        <Card className="mx-4 md:mx-0">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
              Uploaded Photos ({data.images.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {data.images.map((url: string, index: number) => (
                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border touch-manipulation">
                  <img src={url} alt={`upload-${index}`} className="w-full h-full object-cover" />

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 md:gap-2 p-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 bg-black/40 md:bg-transparent p-2 md:p-1"
                      onClick={() => setAsHero(url)}
                      title="Set as cover image"
                    >
                      <Star className={`w-4 h-4 md:w-3 md:h-3 ${data.hero_image_url === url ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 bg-black/40 md:bg-transparent p-2 md:p-1"
                      onClick={() => window.open(url, '_blank')}
                      title="View full size"
                    >
                      <Eye className="w-4 h-4 md:w-3 md:h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 bg-black/40 md:bg-transparent p-2 md:p-1"
                      onClick={() => removeImage(url)}
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4 md:w-3 md:h-3" />
                    </Button>
                  </div>

                  {/* Cover image badge */}
                  {data.hero_image_url === url && (
                    <div className="absolute top-1 md:top-2 left-1 md:left-2">
                      <Badge variant="default" className="bg-yellow-500 text-black text-xs px-1 md:px-2 py-0 md:py-1">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Cover
                      </Badge>
                    </div>
                  )}

                  {/* Image number */}
                  <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2">
                    <Badge variant="secondary" className="text-xs px-1 md:px-2 py-0 md:py-1">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Photo Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            AI Photo Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            These photos help buyers trust your listing and make better decisions:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AI_SUGGESTIONS.map(suggestion => (
              <div
                key={suggestion.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm"
              >
                <span className="text-lg">{suggestion.icon}</span>
                <span className="text-gray-700">{suggestion.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Quality Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {QUALITY_TIPS.map((tip, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features (Collapsible) */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <VideoIcon className="w-5 h-5" />
              Advanced Features
            </div>
            <Badge variant="outline">Advanced</Badge>
          </CardTitle>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <Alert>
              <Video className="w-4 h-4" />
              <AlertDescription>
                Advanced features are available for premium users. These include video uploads, 360° views, and AI-powered photo enhancement.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Video Upload</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Upload short videos to showcase the vehicle in action.
                </p>
                <Button variant="outline" size="sm" disabled>
                  <Video className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">AI Photo Enhancement</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Automatically improve photo quality and remove backgrounds.
                </p>
                <Button variant="outline" size="sm" disabled>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Enhance Photos
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}