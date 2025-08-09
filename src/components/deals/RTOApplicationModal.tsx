import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Shield, Check, Loader2 } from 'lucide-react';
import { RTOApplication } from '@/api/entities';

const REQUIRED_DOCS = {
  seller: ['Original RC', 'Form 29 & 30', 'Insurance Copy', 'PUC Certificate'],
  buyer: ['Aadhar Card', 'PAN Card', 'Address Proof']
};

export default function RTOApplicationModal({ transaction, buyer, seller, onClose, onComplete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const rtoData = {
        transaction_id: transaction.id,
        status: 'submitted',
        application_number: `RTOAPP${Date.now()}`,
        // In a real app, these would be links to uploaded documents
        buyer_documents: REQUIRED_DOCS.buyer,
        seller_documents: REQUIRED_DOCS.seller
      };

      const newApplication = await RTOApplication.create(rtoData);
      onComplete(newApplication.id);
    } catch (e) {
      console.error("RTO submission failed:", e);
      setError("RTO application submission failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Initiate RTO Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600">
            This will start the ownership transfer process. Ensure both parties have prepared the necessary documents.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Seller Docs */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-1"><User className="w-4 h-4"/> Seller Documents</h3>
              <ul className="space-y-2">
                {REQUIRED_DOCS.seller.map(doc => (
                  <li key={doc} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Buyer Docs */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-1"><User className="w-4 h-4"/> Buyer Documents</h3>
              <ul className="space-y-2">
                {REQUIRED_DOCS.buyer.map(doc => (
                  <li key={doc} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Aura&apos;s RTO service will handle the submission and follow-up on your behalf. You will be notified of any updates.</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit RTO Application
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}