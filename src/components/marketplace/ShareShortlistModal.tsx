import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Shortlist } from '@/api/entities';
import { X, Share2, Copy, Calendar, Eye, EyeOff } from 'lucide-react';

export default function ShareShortlistModal({ shortlist, vehicles = [], onClose }) {
  const [shareSettings, setShareSettings] = useState({
    hidePrices: false,
    expiresIn: '7_days'
  });
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateShareLink = async () => {
    try {
      setIsGenerating(true);
      
      // Calculate expiry date
      const expiryDate = new Date();
      switch (shareSettings.expiresIn) {
        case '1_day':
          expiryDate.setDate(expiryDate.getDate() + 1);
          break;
        case '7_days':
          expiryDate.setDate(expiryDate.getDate() + 7);
          break;
        case '30_days':
          expiryDate.setDate(expiryDate.getDate() + 30);
          break;
        case 'never':
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          break;
      }

      // Generate share token and update shortlist
      const shareToken = Math.random().toString(36).substr(2, 12);
      
      await Shortlist.update(shortlist.id, {
        is_shared: true,
        share_token: shareToken,
        share_expires_at: expiryDate.toISOString(),
        hide_prices: shareSettings.hidePrices
      });

      const url = `${window.location.origin}/shared/shortlist/${shareToken}`;
      setShareUrl(url);

      toast({
        title: 'Share link generated',
        description: 'Your shortlist is now ready to share'
      });

    } catch (error) {
      // Error generating share link - handled gracefully
      toast({
        title: 'Error',
        description: 'Failed to generate share link',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Copied to clipboard',
      description: 'Share link has been copied'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Share Shortlist</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Shortlist Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg">{shortlist.name}</h3>
            <p className="text-sm text-slate-600 mt-1">
              {vehicles.length} vehicles • Total value: {
                shareSettings.hidePrices 
                  ? 'Hidden' 
                  : formatPrice(vehicles.reduce((sum, v) => sum + (v.asking_price || 0), 0))
              }
            </p>
          </div>

          {/* Share Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Share Settings</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="hide-prices">Hide Prices</Label>
                <EyeOff className="w-4 h-4 text-slate-400" />
              </div>
              <Switch
                id="hide-prices"
                checked={shareSettings.hidePrices}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, hidePrices: checked }))
                }
              />
            </div>

            <div>
              <Label>Link Expires</Label>
              <select
                value={shareSettings.expiresIn}
                onChange={(e) => setShareSettings(prev => ({ ...prev, expiresIn: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="1_day">1 day</option>
                <option value="7_days">7 days</option>
                <option value="30_days">30 days</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>

          {/* Vehicle Preview */}
          <div>
            <h4 className="font-medium mb-3">Vehicles in this shortlist</h4>
            <div className="grid gap-3 max-h-48 overflow-y-auto">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-xs text-slate-600">{vehicle.variant}</div>
                  </div>
                  <div className="text-sm font-medium">
                    {shareSettings.hidePrices ? 'Price Hidden' : formatPrice(vehicle.asking_price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generate/Show Share Link */}
          {!shareUrl ? (
            <Button 
              onClick={generateShareLink} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Share Link'}
            </Button>
          ) : (
            <div className="space-y-3">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                This link will expire on {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {shareUrl && (
              <Button onClick={copyToClipboard} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}