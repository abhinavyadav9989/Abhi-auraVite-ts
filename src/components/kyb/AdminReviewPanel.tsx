import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Flag,
  User,
  Building,
  FileText
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"; // AD-03

// Mock document URLs
const MOCK_DOCS = {
  gstin: 'https://via.placeholder.com/600x800.png?text=GSTIN+Document',
  pan_number: 'https://via.placeholder.com/600x800.png?text=PAN+Card',
  address: 'https://via.placeholder.com/600x800.png?text=Address+Proof'
};

export default function AdminReviewPanel({ dealer, onVerify, rejectionNotes, setRejectionNotes }) {
  const [activeDoc, setActiveDoc] = useState('gstin');
  const { toast } = useToast(); // AD-03

  const handleResolution = async (resolutionType) => { // AD-01
    if (resolutionType === 'refund_50') {
      await onVerify(dealer.id, { status: 'resolved', resolution: '50% Refund to Buyer' });
      toast({ title: "Dispute Resolved", description: "50% refund has been processed." });
    } else if (resolutionType === 'reject_claim') {
      await onVerify(dealer.id, { status: 'resolved', resolution: 'Claim Rejected' });
      toast({ title: "Dispute Resolved", description: "Claim has been rejected." });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            {dealer.business_name}
            <Badge variant={dealer.is_flagged ? "destructive" : "secondary"}>
              {dealer.is_flagged ? 'Flagged' : 'Not Flagged'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-slate-500">Owner:</span> {dealer.owner_name}</div>
          <div><span className="font-medium text-slate-500">Phone:</span> {dealer.phone}</div>
          <div><span className="font-medium text-slate-500">GSTIN:</span> {dealer.gstin}</div>
          <div><span className="font-medium text-slate-500">PAN:</span> {dealer.pan_number}</div>
          <div className="col-span-2"><span className="font-medium text-slate-500">Address:</span> {dealer.address}, {dealer.city}, {dealer.state}</div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Document List */}
        <div className="col-span-1 space-y-2">
          <Button variant={activeDoc === 'gstin' ? 'default' : 'outline'} className="w-full justify-start gap-2" onClick={() => setActiveDoc('gstin')}>
            <Building className="w-4 h-4" /> GSTIN
          </Button>
          <Button variant={activeDoc === 'pan_number' ? 'default' : 'outline'} className="w-full justify-start gap-2" onClick={() => setActiveDoc('pan_number')}>
            <User className="w-4 h-4" /> PAN Card
          </Button>
          <Button variant={activeDoc === 'address' ? 'default' : 'outline'} className="w-full justify-start gap-2" onClick={() => setActiveDoc('address')}>
            <FileText className="w-4 h-4" /> Address Proof
          </Button>
        </div>

        {/* Document Viewer */}
        <div className="col-span-2 bg-slate-100 rounded-lg flex items-center justify-center p-4">
          {MOCK_DOCS[activeDoc] ? (
            <img src={MOCK_DOCS[activeDoc]} alt={`${activeDoc} document`} className="max-w-full max-h-full object-contain" />
          ) : (
            <p>Select a document to view</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder="Rejection notes (required if rejecting)"
          value={rejectionNotes}
          onChange={(e) => setRejectionNotes(e.target.value)}
        />
        <div className="flex gap-2">
          <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2" onClick={() => onVerify('approve')}>
            <CheckCircle className="w-4 h-4" /> Approve
          </Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 gap-2" onClick={() => onVerify('reject')}>
            <XCircle className="w-4 h-4" /> Reject
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => onVerify('flag')}>
            <Flag className="w-4 h-4" /> {dealer.is_flagged ? 'Unflag' : 'Flag'} Dealer
          </Button>
        </div>
        <p className="text-xs text-center text-slate-500">
          Keyboard shortcuts: Press &apos;A&apos; to Approve, &apos;R&apos; to Reject, &larr; / &rarr; to navigate dealers.
        </p>
      </div>
    </div>
  );
}