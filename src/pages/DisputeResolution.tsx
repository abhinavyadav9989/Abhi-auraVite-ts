
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Transaction, Dealer, Vehicle, Payment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertTriangle, Gavel, Loader2, Paperclip, MessageSquare } from 'lucide-react';
import ChatMessages from '../components/deal-room/ChatMessages'; // Re-using this component
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const EvidenceViewer = ({ evidence, partyName }) => (
  <div className="space-y-2">
    <h4 className="font-semibold">{partyName}&apos;s Evidence</h4>
    {evidence && evidence.length > 0 ? (
      evidence.map((file, index) => (
        <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <Paperclip className="w-4 h-4" />
          Evidence File {index + 1}
        </a>
      ))
    ) : (
      <p className="text-sm text-slate-500">No evidence uploaded.</p>
    )}
  </div>
);

export default function DisputeResolution() {
  const location = useLocation();
  const [transaction, setTransaction] = useState(null);
  // buyer and seller states are not used with the mock data, but keeping structure for future integration
  const [buyer, setBuyer] = useState(null);
  const [seller, setSeller] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const transactionId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    // Mock fetching transaction data
    const fetchTransaction = async () => {
      // In a real application, you would fetch from your backend:
      // const data = await Transaction.get(transactionId);
      const data = {
        id: transactionId,
        status: 'disputed',
        dispute_reason: 'Vehicle has engine noise not mentioned in listing.',
        // Mock evidence (not in outline, but needed for UI)
        dispute_evidence: ['/path/to/buyer_evidence1.pdf'],
        messages: [{
          id: 'msg1', type: 'system', content: 'Dispute opened by buyer.', timestamp: new Date().toISOString()
        }]
        // Mock buyer/seller IDs if needed for UI, but the outline removed buyer/seller state updates
        // buyer_id: 'buyer123',
        // seller_id: 'seller456'
      };
      setTransaction(data);
      setIsLoading(false);

      // Note: The outline removed buyer/seller fetching. 
      // If needed for UI, they would be fetched here based on transaction.buyer_id/seller_id.
      // Example:
      // const [b, s] = await Promise.all([
      //   Dealer.get(data.buyer_id),
      //   Dealer.get(data.seller_id)
      // ]);
      // setBuyer(b);
      // setSeller(s);
    };
    if (transactionId) {
      fetchTransaction();
    } else {
      setIsLoading(false);
    }
  }, [transactionId]);

  const handleResolve = async (resolution, message) => {
    // isProcessing state and logic removed as per outline for simplified mock
    try {
      const newMessages = [
        ...(transaction.messages || []),
        { id: Date.now().toString(), type: 'system', content: message, timestamp: new Date().toISOString() }
      ];

      // In a real application, you would update your backend:
      // await Transaction.update(transactionId, {
      //   status: 'completed', // Or 'cancelled', depending on resolution
      //   messages: newMessages,
      // });
      // Logic to refund/release payment if applicable:
      // if (transaction.payment_id) {
      //   const escrowStatus = resolution === 'refund_full' || resolution === 'refund_50' ? 'refunded' : 'released';
      //   await Payment.update(transaction.payment_id, { escrow_status: escrowStatus });
      // }


      // Mock update for UI
      setTransaction(prev => ({ ...prev, status: 'completed', messages: newMessages }));

      toast({
        title: "Dispute Resolved",
        description: message,
      });

    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      toast({
        title: "Error",
        description: "Could not resolve the dispute. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>;
  if (!transaction) return <div className="p-8 text-center">Dispute not found or no ID provided.</div>;

  return (
    <>
      <Toaster />
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dispute Mediation</h1>
              <p className="text-slate-500">Transaction ID: {transaction.id}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Panel: Chat & Evidence */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dispute Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{transaction.dispute_reason || "No reason provided."}</p>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="text-base">Buyer Evidence</CardTitle></CardHeader><CardContent><EvidenceViewer evidence={transaction.dispute_evidence} partyName="Buyer" /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Seller Evidence</CardTitle></CardHeader><CardContent><EvidenceViewer evidence={[]} partyName="Seller" /></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" />Negotiation History</CardTitle></CardHeader>
                <CardContent className="h-96 overflow-y-auto">
                  <ChatMessages messages={transaction.messages || []} timeline={[]} currentUserId={null} dealers={{ [buyer?.id]: buyer, [seller?.id]: seller }} />
                </CardContent>
              </Card>
            </div>
            {/* Right Panel: Admin Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Take action to resolve this dispute. This is final.
                  </p>
                  {/* Textarea for private notes (from original, but outline didn't specify placement) */}
                  {/* Keeping it here based on original right panel layout */}
                  <Textarea placeholder="Add private notes for your decision..." rows={4} />
                  <Button
                    className="w-full"
                    onClick={() => handleResolve('refund_50', 'Dispute resolved by admin. 50% refund issued to buyer.')}
                    disabled={transaction.status !== 'disputed'}
                  >
                    Resolve → Refund 50%
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleResolve('refund_full', 'Dispute resolved by admin. Full refund issued to buyer.')}
                    disabled={transaction.status !== 'disputed'}
                  >
                    Resolve → Full Refund
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => handleResolve('reject', 'Dispute rejected by admin. Payment released to seller.')}
                    disabled={transaction.status !== 'disputed'}
                  >
                    Reject Dispute
                  </Button>
                </CardContent>
              </Card>
              {/* Original "Parties Involved" card, kept as per "keep existing code" */}
              <Card>
                <CardHeader><CardTitle className="text-base">Parties Involved</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm">Buyer</h4>
                    {/* These will be empty/null if buyer/seller states are not populated by mock/real data */}
                    <p>{buyer?.business_name || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{buyer?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Seller</h4>
                    <p>{seller?.business_name || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{seller?.phone || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
