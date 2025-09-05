import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  MapPin, 
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';

export default function KybQueueWidget({ queue = [], onApprove, onReject, onRequestInfo }: any) {
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      documents_required: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      documents_submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Review',
      documents_required: 'Docs Required',
      documents_submitted: 'Ready for Review',
      verified: 'Verified',
      rejected: 'Rejected'
    };
    return texts[status] || status;
  };

  const handleApprove = async () => {
    if (!selectedDealer) return;
    setIsProcessing(true);
    try {
      await onApprove(selectedDealer.id, reviewNotes);
      setSelectedDealer(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error approving KYB:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDealer) return;
    setIsProcessing(true);
    try {
      await onReject(selectedDealer.id, reviewNotes);
      setSelectedDealer(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error rejecting KYB:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const KybItem = ({ dealer }) => (
    <div 
      className="p-4 border rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/80 cursor-pointer transition-colors"
      onClick={() => setSelectedDealer(dealer)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">{dealer.business_name}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">{dealer.owner_name}</p>
        </div>
        <Badge className={getStatusColor(dealer.status)}>
          {getStatusText(dealer.status)}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{dealer.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>{dealer.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Submitted {formatDistanceToNow(new Date(dealer.submitted_at))} ago</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>{dealer.documents_count} documents</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card className="h-full dark:bg-slate-900/80 dark:border-slate-700/80">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            KYB Verification Queue
            <Badge variant="secondary">{queue.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queue.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {queue.slice(0, 5).map((dealer) => (
                <KybItem key={dealer.id} dealer={dealer} />
              ))}
              {queue.length > 5 && (
                <div className="text-center py-2">
                  <Button variant="outline" size="sm">
                    View All {queue.length} Applications
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <CheckCircle className="w-12 h-12 mb-4 text-green-500" />
              <p className="text-center">All caught up! No pending KYB applications.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedDealer && (
        <Dialog open={!!selectedDealer} onOpenChange={() => setSelectedDealer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review KYB Application</DialogTitle>
              <DialogDescription>
                {selectedDealer.business_name} - {selectedDealer.owner_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Business:</strong> {selectedDealer.business_name}
                </div>
                <div>
                  <strong>Owner:</strong> {selectedDealer.owner_name}
                </div>
                <div>
                  <strong>Location:</strong> {selectedDealer.city}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedDealer.phone}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <Badge className={`ml-2 ${getStatusColor(selectedDealer.status)}`}>
                    {getStatusText(selectedDealer.status)}
                  </Badge>
                </div>
                <div>
                  <strong>Documents:</strong> {selectedDealer.documents_count} uploaded
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Verification Notes</label>
                <Textarea
                  placeholder="Add notes about the verification decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedDealer(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={isProcessing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}