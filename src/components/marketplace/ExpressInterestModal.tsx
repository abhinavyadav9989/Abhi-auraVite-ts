import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { DealerInquiry } from '@/api/entities';
import { X, Send, Heart } from 'lucide-react';

type ExpressInterestModalProps = {
  vehicle?: any;
  dealer?: any;
  onClose: () => void;
};

export default function ExpressInterestModal({ vehicle = {}, dealer = {}, onClose }: ExpressInterestModalProps) {
  const safeVehicle: any = vehicle || {};
  const [formData, setFormData] = useState({
    message: `Hi, I'm interested in your ${safeVehicle.year || ''} ${safeVehicle.make || ''} ${safeVehicle.model || ''}. Please share more details.`,
    timeline: 'within_week',
    budgetMin: safeVehicle.asking_price ? Math.floor(Number(safeVehicle.asking_price) * 0.9) : 0,
    budgetMax: safeVehicle.asking_price ? Math.floor(Number(safeVehicle.asking_price) * 1.1) : 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await DealerInquiry.create({
        dealer_id: (dealer as any).id || '',
        customer_name: 'Interested Dealer', // In real app, would be current user's name
        customer_phone: '', // Would be from user profile
        customer_email: '', // Would be from user profile
        message: formData.message,
        source: 'marketplace_express_interest',
        inquiry_type: 'vehicle_interest',
        vehicle_interest: safeVehicle.id,
        budget_range: {
          min: formData.budgetMin,
          max: formData.budgetMax
        },
        timeline: formData.timeline,
        priority: 'medium'
      });

      toast({
        title: 'Interest Expressed',
        description: 'Your interest has been sent to the dealer. They will contact you soon.',
      });

      onClose();
    } catch (error) {
      console.error('Error expressing interest:', error);
      toast({
        title: 'Error',
        description: 'Failed to express interest. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return '0';
    return `₹${(price / 100000).toFixed(1)}L`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold">Express Interest</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Vehicle Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-medium">{safeVehicle.year} {safeVehicle.make} {safeVehicle.model}</h3>
            <p className="text-sm text-slate-600">{safeVehicle.variant}</p>
            <p className="text-lg font-bold text-blue-600 mt-1">
              {formatPrice(Number(safeVehicle.asking_price || 0))}
            </p>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message to Dealer</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budgetMin">Budget Min</Label>
              <Input
                id="budgetMin"
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="budgetMax">Budget Max</Label>
              <Input
                id="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Timeline */}
          <div>
            <Label htmlFor="timeline">Purchase Timeline</Label>
            <select
              id="timeline"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            >
              <option value="immediate">Immediate</option>
              <option value="within_week">Within a week</option>
              <option value="within_month">Within a month</option>
              <option value="within_quarter">Within 3 months</option>
              <option value="no_urgency">No urgency</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Express Interest
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}