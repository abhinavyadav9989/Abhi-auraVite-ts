import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Copy, QrCode, Share2, Calendar, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ShareLinkModalProps = {
  vehicle: any;
  dealerSettings?: any;
  onClose: () => void;
}

export default function ShareLinkModal({ vehicle, dealerSettings, onClose }: ShareLinkModalProps) {
  const [hidePrice, setHidePrice] = useState(false);
  const [expiry, setExpiry] = useState('30'); // days
  const [shareableLink, setShareableLink] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Generate shareable link
    const baseUrl = window.location.origin;
    const vehicleUrl = `${baseUrl}${createPageUrl("PublicVehicleView")}?id=${vehicle.id}`;
    const params = new URLSearchParams();
    
    if (hidePrice) {
      params.append('hide_price', 'true');
    }
    
    if (expiry && expiry !== '30') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiry));
      params.append('expires', expiryDate.toISOString());
    }
    
    const finalUrl = params.toString() ? `${vehicleUrl}&${params.toString()}` : vehicleUrl;
    setShareableLink(finalUrl);
  }, [vehicle.id, hidePrice, expiry]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      toast({ title: 'Link Copied!', description: 'Share link copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Copy Failed', description: 'Could not copy link to clipboard.', variant: 'destructive' });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          text: `Check out this ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          url: shareableLink
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share Vehicle
          </DialogTitle>
          <DialogDescription>
            Share a public link to the {vehicle.year} {vehicle.make} {vehicle.model}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* QR Code */}
          <div className="flex items-center justify-center p-4 bg-slate-100 rounded-lg">
            {shareableLink && (
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(shareableLink)}`}
                alt="QR Code"
                width={128}
                height={128}
                className="rounded"
              />
            )}
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hide-price" className="text-sm font-medium">
                Hide Price
              </Label>
              <Switch
                id="hide-price"
                checked={hidePrice}
                onCheckedChange={setHidePrice}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Link Expires In</Label>
              <Select value={expiry} onValueChange={(v) => setExpiry(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Link Preview */}
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={shareableLink} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className={copied ? 'bg-green-50 border-green-200' : ''}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Link Preview Info */}
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Preview:</span>
              </div>
              <div className="space-y-1 text-blue-600">
                <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                <div className="text-xs">{vehicle.registration_number}</div>
                {!hidePrice && vehicle.asking_price && (
                  <div className="font-medium">₹{(vehicle.asking_price / 100000).toFixed(1)}L</div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{vehicle.fuel_type}</Badge>
                  <Badge variant="outline" className="text-xs">{vehicle.transmission}</Badge>
                  {vehicle.kilometers && (
                    <Badge variant="outline" className="text-xs">{vehicle.kilometers.toLocaleString()} km</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            
            {navigator.share ? (
              <Button onClick={handleNativeShare} className="flex-1 gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            ) : (
              <Button onClick={handleCopyLink} className="flex-1 gap-2">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}