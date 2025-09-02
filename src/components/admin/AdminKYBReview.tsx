import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Download,
  AlertTriangle,
  Shield,
  Award
} from 'lucide-react';
import { Dealer, DealerDocument } from '@/api/entities';

interface PendingDealer {
  id: string;
  business_name: string;
  owner_name: string;
  gstin: string;
  pan_number: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  verification_status: string;
  submitted_at: string;
  documents: Array<{
    id: string;
    document_type: string;
    file_name: string;
    file_url: string;
    status: string;
  }>;
}

export default function AdminKYBReview() {
  const [pendingDealers, setPendingDealers] = useState<PendingDealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<PendingDealer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPendingDealers();
  }, []);

  const loadPendingDealers = async () => {
    try {
      setIsLoading(true);

      // Load dealers pending review
      const dealers = await Dealer.filter({
        verification_status: 'documents_submitted'
      });

      // Load documents for each dealer
      const dealersWithDocs = await Promise.all(
        dealers.map(async (dealer) => {
          const documents = await DealerDocument.filter({ dealer_id: dealer.id });

          return {
            ...dealer,
            documents: documents.map(doc => ({
              id: doc.id,
              document_type: doc.document_type,
              file_name: doc.file_name,
              file_url: doc.file_url,
              status: doc.status
            }))
          };
        })
      );

      setPendingDealers(dealersWithDocs);
    } catch (error) {
      console.error('Error loading pending dealers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending applications.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (dealerId: string) => {
    if (!reviewNotes.trim()) {
      toast({
        title: 'Review Notes Required',
        description: 'Please provide review notes before approving.',
        variant: 'destructive'
      });
      return;
    }

    setIsReviewing(true);
    try {
      // Update dealer status
      await Dealer.update(dealerId, {
        verification_status: 'verified',
        verification_status_new: 'verified',
        kyb_completed: true,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
        approved_by: 'admin' // In real app, get current admin user
      });

      // Update document statuses
      const documents = await DealerDocument.filter({ dealer_id: dealerId });
      for (const doc of documents) {
        await DealerDocument.update(doc.id, {
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        });
      }

      toast({
        title: 'Application Approved',
        description: 'Dealer verification has been approved.',
      });

      // Refresh the list
      await loadPendingDealers();
      setSelectedDealer(null);
      setReviewNotes('');

    } catch (error) {
      console.error('Error approving dealer:', error);
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve the application.',
        variant: 'destructive'
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async (dealerId: string) => {
    if (!reviewNotes.trim()) {
      toast({
        title: 'Review Notes Required',
        description: 'Please provide detailed rejection reasons.',
        variant: 'destructive'
      });
      return;
    }

    setIsReviewing(true);
    try {
      // Update dealer status
      await Dealer.update(dealerId, {
        verification_status: 'rejected',
        verification_status_new: 'rejected',
        kyb_completed: false,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
        rejection_reason: reviewNotes
      });

      // Update document statuses
      const documents = await DealerDocument.filter({ dealer_id: dealerId });
      for (const doc of documents) {
        await DealerDocument.update(doc.id, {
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        });
      }

      toast({
        title: 'Application Rejected',
        description: 'Dealer verification has been rejected.',
        variant: 'destructive'
      });

      // Refresh the list
      await loadPendingDealers();
      setSelectedDealer(null);
      setReviewNotes('');

    } catch (error) {
      console.error('Error rejecting dealer:', error);
      toast({
        title: 'Rejection Failed',
        description: 'Failed to reject the application.',
        variant: 'destructive'
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const renderDealerDetails = (dealer: PendingDealer) => (
    <div className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-600">Business Name</Label>
              <p className="text-sm">{dealer.business_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Owner Name</Label>
              <p className="text-sm">{dealer.owner_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">GSTIN</Label>
              <p className="text-sm font-mono">{dealer.gstin}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">PAN Number</Label>
              <p className="text-sm font-mono">{dealer.pan_number}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Phone</Label>
              <p className="text-sm">{dealer.phone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Email</Label>
              <p className="text-sm">{dealer.email}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-600">Business Address</Label>
            <p className="text-sm">
              {dealer.address}, {dealer.city}, {dealer.state} - {dealer.pincode}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-600">Submitted</Label>
            <p className="text-sm text-slate-600">
              {new Date(dealer.submitted_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submitted Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dealer.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {doc.document_type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-600">{doc.file_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.status === 'pending_review' ? 'secondary' : 'default'}>
                    {doc.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Review Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="review-notes">Review Notes *</Label>
            <Textarea
              id="review-notes"
              placeholder="Provide detailed feedback for your decision..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleApprove(dealer.id)}
              disabled={isReviewing || !reviewNotes.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isReviewing ? 'Approving...' : 'Approve Application'}
            </Button>
            <Button
              onClick={() => handleReject(dealer.id)}
              disabled={isReviewing || !reviewNotes.trim()}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isReviewing ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading pending applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KYB Review Queue</h1>
          <p className="text-slate-600 mt-1">
            Review and approve dealer verification applications
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {pendingDealers.length} pending
        </Badge>
      </div>

      {pendingDealers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">All Caught Up!</h3>
            <p className="text-slate-600">
              No pending applications to review at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingDealers.map((dealer) => (
                  <div
                    key={dealer.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDealer?.id === dealer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedDealer(dealer)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {dealer.business_name}
                        </p>
                        <p className="text-sm text-slate-600 truncate">
                          {dealer.owner_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(dealer.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">
                        {dealer.documents.length} documents
                      </Badge>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedDealer ? (
              renderDealerDetails(selectedDealer)
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Select an Application
                  </h3>
                  <p className="text-slate-600">
                    Choose a dealer application from the list to review their details and documents.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
