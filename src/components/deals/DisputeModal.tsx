import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShieldQuestion, Loader2 } from 'lucide-react';

export default function DisputeModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldQuestion className="w-6 h-6 text-red-600" />
            Raise a Dispute
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Please provide a clear reason for the dispute. An Aura admin will review the case within 24 hours. Your funds will remain locked in escrow.
          </p>
          <div className="space-y-2">
            <Label htmlFor="dispute-reason">Reason for Dispute</Label>
            <Textarea
              id="dispute-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Vehicle not as described, significant damages found upon delivery..."
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !reason.trim()} 
            variant="destructive"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Submit Dispute
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}