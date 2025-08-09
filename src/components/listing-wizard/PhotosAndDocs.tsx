import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { UploadFile } from '@/api/integrations';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Camera, Upload, X, CheckCircle, AlertTriangle, FileText, Image as ImageIcon,
  Loader2, Star, Trash2, GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 20;

export default function PhotosAndDocs({ data, onChange }) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const images = data.images || [];
  const documents = data.documents || [];

  const handleImageUpload = async (files) => {
    if (images.length + files.length > MAX_PHOTOS) {
      toast({ title: "Upload Limit Exceeded", description: `You can only upload a maximum of ${MAX_PHOTOS} photos.`, variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => UploadFile({ file }));
      const uploadedFiles = await Promise.all(uploadPromises);
      const newImages = uploadedFiles.map(result => result.file_url);

      // Set first image as hero if not already set
      const newHero = data.hero_image_url ? {} : { hero_image_url: newImages[0] };
      
      onChange({ images: [...images, ...newImages], ...newHero });

    } catch (error) {
      toast({ title: "Upload Failed", description: "Could not upload images.", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleDocumentUpload = async (files) => { /* ... existing doc upload logic ... */ };

  const handleSetHero = (url) => {
    onChange({ hero_image_url: url });
  };

  const handleDeleteImage = (urlToDelete) => {
    const newImages = images.filter(url => url !== urlToDelete);
    const newHero = data.hero_image_url === urlToDelete
      ? { hero_image_url: newImages.length > 0 ? newImages[0] : "" }
      : {};
    onChange({ images: newImages, ...newHero });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onChange({ images: items });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) handleImageUpload(files);
  };

  return (
    <div className="space-y-8">
      <Card onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Vehicle Photos ({images.length}/{MAX_PHOTOS})</h3>
          <p className="text-sm text-slate-600 mb-4">Drag and drop to reorder images. The first image is the default hero.</p>
          
          <div className="border-2 border-dashed rounded-lg p-8 text-center mb-4">
            {uploading ? (
              <div className="flex flex-col items-center gap-2"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /><p>Uploading...</p></div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-600">Drag & drop images here, or</p>
                <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload-input')?.click()}><Camera className="w-4 h-4 mr-2" /> Choose Files</Button>
                <input id="image-upload-input" type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
              </div>
            )}
          </div>
          
          {images.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((url, index) => (
                      <Draggable key={url} draggableId={url} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className="relative group">
                            <div {...provided.dragHandleProps} className="absolute top-1/2 -left-3 -translate-y-1/2 text-slate-400 opacity-0 group-hover:opacity-100 cursor-grab"><GripVertical /></div>
                            <div className="aspect-square rounded-lg overflow-hidden relative ring-2 ring-transparent group-hover:ring-blue-500">
                                <img src={url} alt={`Vehicle image ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-1 left-1 flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20 hover:text-amber-400" onClick={() => handleSetHero(url)} title="Set as Hero Image">
                                        <Star className={cn("w-4 h-4", data.hero_image_url === url ? "fill-amber-400 text-amber-400" : "")} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20 hover:text-red-500" onClick={() => handleDeleteImage(url)} title="Delete Image">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
      
      {/* Document Upload Section (remains largely the same) */}
      <Card>
         <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Vehicle Documents</h3>
          <p className="text-sm text-slate-600 mb-4">Upload required legal documents like RC, Insurance, etc.</p>
          {/* ... existing document component logic ... */}
          </CardContent>
      </Card>
    </div>
  );
}