import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Link, QrCode, Share2, Mail, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ShareModal({ vehicle, onClose }) {
  const [hidePrice, setHidePrice] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const vehicleUrl = `${baseUrl}/vehicle/${vehicle.id}`;
    return hidePrice ? `${vehicleUrl}?hidePrice=true` : vehicleUrl;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Link copied to clipboard." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" });
    }
  };

  const shareUrl = generateShareUrl();
  const vehicleTitle = `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Vehicle
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="direct">Direct Share</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            {/* Vehicle Preview */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                {vehicle?.images?.[0] && (
                  <img 
                    src={vehicle.images[0]} 
                    alt={vehicleTitle}
                    className="w-16 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <div className="font-medium text-sm">{vehicleTitle}</div>
                  <div className="text-xs text-slate-600">{vehicle?.registration_number}</div>
                  {!hidePrice && (
                    <div className="text-sm font-medium text-blue-600">
                      ₹{(vehicle?.asking_price / 100000)?.toFixed(1)}L
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hidePrice" 
                  checked={hidePrice}
                  onCheckedChange={setHidePrice}
                />
                <Label htmlFor="hidePrice" className="text-sm">
                  Hide price in shared link
                </Label>
              </div>

              <div>
                <Label className="text-sm">Custom Message (Optional)</Label>
                <Input
                  placeholder="Add a personal note..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Share URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="direct" className="space-y-4">
            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 justify-start"
                onClick={() => {
                  const whatsappText = `Check out this ${vehicleTitle}: ${shareUrl}${customMessage ? '\n\n' + customMessage : ''}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`);
                }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>

              <Button 
                variant="outline" 
                className="flex items-center gap-2 justify-start"
                onClick={() => {
                  const emailSubject = `Vehicle: ${vehicleTitle}`;
                  const emailBody = `I wanted to share this vehicle with you:\n\n${vehicleTitle}\n${shareUrl}${customMessage ? '\n\n' + customMessage : ''}`;
                  window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
                }}
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <QrCode className="w-16 h-16 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-600">QR Code for quick sharing</p>
              <p className="text-xs text-slate-500 mt-1">Scan to view vehicle details</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => copyToClipboard(shareUrl)}>
            <Link className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}