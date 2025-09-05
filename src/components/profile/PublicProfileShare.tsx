import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  QrCode, 
  ExternalLink,
  Star,
  MapPin,
  Phone,
  Clock,
  Car
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from '@/utils';

export default function PublicProfileShare({ 
  dealer, 
  vehicles = [], 
  reviews = [], 
  businessHours = [], 
  isCurrentlyOpen = false,
  inspectionCoverage = 0,
  expanded = false 
}) {
  const [publicUrl, setPublicUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (dealer) {
      const url = `${window.location.origin}${createPageUrl(`PublicDealer?id=${dealer.id}`)}`;
      setPublicUrl(url);
    }
  }, [dealer]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      toast({ title: "Link copied to clipboard!" });
    });
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1);
  };

  if (!dealer) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-slate-500 dark:text-slate-400">Loading dealer information...</p>
      </div>
    );
  }

  if (!expanded) {
    // Compact version for header
    return (
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share Profile
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Public Profile</DialogTitle>
            <DialogDescription>
              Share your dealer profile with customers and partners
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-100 rounded-lg flex justify-center">
              <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly />
                <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button asChild className="w-full">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Public Page
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Full expanded version for tab content
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Public Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Public Profile URL</h3>
            <div className="flex gap-2">
              <Input value={publicUrl} readOnly />
              <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
              Share this link with customers to showcase your dealership
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Button asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Public Page
              </a>
            </Button>
            <Button variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Public Profile Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Public Profile Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {dealer.business_name?.[0]?.toUpperCase() || 'D'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {dealer.business_name}
                </h2>
                {dealer.tagline && (
                  <p className="text-slate-600 dark:text-slate-300 mb-2">{dealer.tagline}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 dark:text-white">{dealer.city}, {dealer.state}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-slate-900 dark:text-white">{getAverageRating()} ({reviews.length} reviews)</span>
                  </div>
                  <Badge variant={isCurrentlyOpen ? "default" : "secondary"}>
                    <Clock className="w-3 h-3 mr-1" />
                    {isCurrentlyOpen ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-slate-900 dark:text-white">Contact</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 dark:text-white">{dealer.phone || 'Not available'}</span>
                  </div>
                  {dealer.whatsapp && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-green-600">📱</span>
                      <span className="text-slate-900 dark:text-white">{dealer.whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-slate-900 dark:text-white">Inventory</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-white">Live Vehicles</span>
                    <Badge variant="secondary">{vehicles.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-white">Inspection Coverage</span>
                    <Badge variant="secondary">{inspectionCoverage}%</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-slate-900 dark:text-white">Trust Indicators</h3>
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-700">
                    ✓ Verified Business
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700">
                    ✓ KYB Completed  
                  </Badge>
                </div>
              </div>
            </div>

            {dealer.description && (
              <div className="mt-6">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">About Us</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{dealer.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}