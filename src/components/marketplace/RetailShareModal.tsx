import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { IndianRupee, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DealerPreferences } from '@/api/entities';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

const formatCurrency = (amount) => amount ? `₹${(amount / 100000).toFixed(2)}L` : '₹0.00L';

export default function RetailShareModal({ vehicle, transaction, onClose }) {
  const [markup, setMarkup] = useState(10); // Default 10%
  const [hidePrice, setHidePrice] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const user = await User.me();
        const dealerPrefs = await DealerPreferences.filter({ created_by: user.email });
        if (dealerPrefs.length > 0 && dealerPrefs[0].default_markup_pct) {
          setMarkup(dealerPrefs[0].default_markup_pct);
        }
      } catch (error) {
        console.error("Could not fetch dealer preferences:", error);
      }
    };
    fetchPrefs();
  }, []);

  const landedCost = transaction.final_price || transaction.current_offer;
  const retailPrice = landedCost * (1 + markup / 100);

  useEffect(() => {
    // F-B2: Encode price in a token for the URL. In a real app, this would be a secure JWT or similar.
    const priceToken = btoa(JSON.stringify({ price: retailPrice }));
    const generatedLink = `${window.location.origin}${createPageUrl(`PublicVehicleView?id=${vehicle.id}&token=${priceToken}&hp=${hidePrice ? 1 : 0}`)}`;
    setShareLink(generatedLink);
  }, [vehicle, retailPrice, hidePrice]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({ title: 'Link Copied!', description: 'You can now share it with your customer.' });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share to Customer</DialogTitle>
          <DialogDescription>
            Set a retail price for your customer and generate a shareable link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Your Landed Cost: {formatCurrency(landedCost)}</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="markup">Retail Markup: {markup}%</Label>
            {(() => { const SliderAny: any = Slider as any; return (
            <SliderAny
              id="markup"
              min={0}
              max={25}
              step={1}
              value={[Number(markup)]}
              onValueChange={(value: number[]) => setMarkup(value[0])}
            />) })()}
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <Label className="text-sm text-slate-600">Suggested Retail Price</Label>
            <p className="text-2xl font-bold text-blue-700 flex items-center justify-center gap-1">
              <IndianRupee className="w-6 h-6" />
              {formatCurrency(retailPrice)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="hide-price" checked={hidePrice} onCheckedChange={(checked) => setHidePrice(checked === true)} />
            <Label htmlFor="hide-price">Hide price on shared link</Label>
          </div>
          <div className="relative">
            <Input value={shareLink} readOnly />
            <Button size="icon" className="absolute right-1 top-1 h-8 w-8" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={copyLink}>
            <Share2 className="mr-2 h-4 w-4" /> Copy & Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}