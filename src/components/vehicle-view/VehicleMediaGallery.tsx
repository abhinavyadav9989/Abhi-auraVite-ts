import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Image, ChevronLeft, ChevronRight } from 'lucide-react';

export default function VehicleMediaGallery({ images = [], videos = [], onImageClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaType, setMediaType] = useState('images'); // 'images' or 'videos'

  const currentMedia = mediaType === 'images' ? images : videos;
  const totalMedia = images.length + videos.length;

  if (totalMedia === 0) {
    return (
      <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-500">
          <Image className="w-12 h-12 mx-auto mb-2" />
          <span>No media available</span>
        </div>
      </div>
    );
  }

  const nextMedia = () => {
    if (mediaType === 'images' && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (mediaType === 'images' && videos.length > 0) {
      setMediaType('videos');
      setCurrentIndex(0);
    } else if (mediaType === 'videos' && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousMedia = () => {
    if (mediaType === 'videos' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (mediaType === 'videos' && images.length > 0) {
      setMediaType('images');
      setCurrentIndex(images.length - 1);
    } else if (mediaType === 'images' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const canGoNext = (mediaType === 'images' && currentIndex < images.length - 1) || 
                   (mediaType === 'images' && videos.length > 0) ||
                   (mediaType === 'videos' && currentIndex < videos.length - 1);

  const canGoPrevious = (mediaType === 'videos' && currentIndex > 0) ||
                       (mediaType === 'videos' && images.length > 0) ||
                       (mediaType === 'images' && currentIndex > 0);

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative">
        <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
          {mediaType === 'images' && images[currentIndex] ? (
            <img
              src={images[currentIndex]}
              alt={`Vehicle image ${currentIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onImageClick && onImageClick(currentIndex)}
            />
          ) : mediaType === 'videos' && videos[currentIndex] ? (
            <video
              src={videos[currentIndex]}
              controls
              className="w-full h-full"
              poster={images[0]} // Use first image as poster if available
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-12 h-12 text-slate-400" />
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {canGoPrevious && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={previousMedia}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        {canGoNext && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={nextMedia}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Media Type Indicator */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
            {mediaType === 'images' ? 'Photo' : 'Video'} {currentIndex + 1} of {currentMedia.length}
          </div>
          {mediaType === 'videos' && (
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Play className="w-3 h-3" />
              Video
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {/* Image Thumbnails */}
        {images.map((image, index) => (
          <div
            key={`img-${index}`}
            className={`flex-shrink-0 w-16 h-16 rounded cursor-pointer border-2 overflow-hidden ${
              mediaType === 'images' && currentIndex === index
                ? 'border-blue-500'
                : 'border-transparent hover:border-slate-300'
            }`}
            onClick={() => {
              setMediaType('images');
              setCurrentIndex(index);
            }}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Video Thumbnails */}
        {videos.map((video, index) => (
          <div
            key={`vid-${index}`}
            className={`flex-shrink-0 w-16 h-16 rounded cursor-pointer border-2 overflow-hidden relative ${
              mediaType === 'videos' && currentIndex === index
                ? 'border-blue-500'
                : 'border-transparent hover:border-slate-300'
            }`}
            onClick={() => {
              setMediaType('videos');
              setCurrentIndex(index);
            }}
          >
            {/* Use first image as video thumbnail or black background */}
            <div className="w-full h-full bg-slate-300 flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Media Count */}
      <div className="text-sm text-slate-600 text-center">
        {images.length} photo{images.length !== 1 ? 's' : ''} 
        {videos.length > 0 && `, ${videos.length} video${videos.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  );
}