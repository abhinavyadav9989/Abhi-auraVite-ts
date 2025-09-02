
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Dealer } from '@/api/entities';
import { DealerDocument } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  User as UserIcon, 
  Building2, 
  Mail, 
  Phone,
  ShieldCheck,
  Eye,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/api/supabaseClient'; // Added supabase import

export default function AdminKYBVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dealer, setDealer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [kybQueue, setKybQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const dealerId = searchParams.get('dealerId');

  // Memoize handleAction for stable dependencies in other callbacks
  const handleAction = useCallback(async (action, notes = "") => {
    try {
      let status;
      let toastTitle;

      switch(action) {
        case 'approve':
          status = 'verified';
          toastTitle = 'Dealer Approved';
          break;
        case 'reject':
          status = 'rejected';
          toastTitle = 'Dealer Rejected';
          break;
        case 'escalate':
          status = 'suspended';
          toastTitle = 'Dealer Escalated & Suspended';
          break;
        default:
          return;
      }
      
      const currentUser = await User.meWithRole();

      // Use SECURITY DEFINER function instead of regular update
      const { data: success, error } = await supabase
        .rpc('update_dealer_verification', {
          dealer_id: dealerId,
          new_status: status,
          notes: notes,
          verified_by_email: currentUser.email
        });

      if (error) {
        console.error('Error calling update_dealer_verification:', error);
        // Fallback to regular update if function doesn't exist
        await Dealer.update(dealerId, { 
          verification_status: status,
          verification_notes: notes,
          verified_by: currentUser.email,
          verified_at: new Date().toISOString()
        });
      } else if (!success) {
        throw new Error('Failed to update dealer verification status');
      }

      toast({ title: toastTitle, description: notes });
      navigate(createPageUrl('AdminDashboard'));

    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      toast({ title: "Error", description: "The action could not be completed.", variant: "destructive" });
    }
  }, [dealerId, navigate, toast]); // Dependencies for useCallback

  const handleApprove = useCallback(() => {
    handleAction('approve', 'All documents verified.');
  }, [handleAction]); // handleAction is now stable

  const handleOpenRejectModal = useCallback(() => {
    setIsRejecting(true);
  }, [setIsRejecting]); // setIsRejecting is stable from useState

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      setIsLoading(true);
      try {
        const user = await User.meWithRole();
        if (user.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You do not have permission to view this page.",
            variant: "destructive",
          });
          navigate(createPageUrl('Dashboard'));
          return;
        }

        if (!dealerId) {
          // Show KYB queue list instead of redirecting
          await loadKYBQueue();
        } else {
          await loadData();
        }

      } catch (error) {
        console.error('Authentication or data loading error:', error);
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page or an error occurred loading data.",
          variant: "destructive",
        });
        navigate(createPageUrl('Dashboard'));
      }
      setIsLoading(false);
    };
    checkAdminAndLoad();
  }, [dealerId, navigate, toast]); // Added navigate and toast to dependency array for useEffect safety

  // ONB-13: Add hotkey support
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger hotkeys if typing in a text area or input
      if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')) {
        return; 
      }
      
      if (event.key.toLowerCase() === 'a') {
        event.preventDefault(); // Prevent default browser actions
        handleApprove();
      }
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault(); // Prevent default browser actions
        handleOpenRejectModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleApprove, handleOpenRejectModal]); // Dependencies for useEffect

  const loadKYBQueue = async () => {
    try {
      // Debug: Check JWT token information
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('=== JWT DEBUG INFO ===');
      console.log('Current user:', user);
      console.log('User email:', user?.email);
      console.log('User metadata:', user?.user_metadata);
      console.log('App metadata:', user?.app_metadata);
      console.log('Session:', session);
      console.log('Access token exists:', !!session?.access_token);
      console.log('=== END JWT DEBUG ===');

      // Use direct SQL query with SECURITY DEFINER function
      const { data: pendingDealers, error } = await supabase
        .rpc('get_pending_kyb_dealers');

      if (error) {
        console.error('Error calling get_pending_kyb_dealers:', error);
        // Fallback to regular filter if function doesn't exist
        const fallbackDealers = await Dealer.filter({
          verification_status: 'documents_submitted'
        });
        setKybQueue(fallbackDealers);
      } else {
        console.log('Pending dealers from function:', pendingDealers);
        setKybQueue(pendingDealers || []);
      }
    } catch (error) {
      console.error('Error loading KYB queue:', error);
      toast({ title: 'Error', description: 'Failed to load KYB queue', variant: 'destructive' });
    }
  };

  const loadData = async () => {
    try {
      const [dealerData, docData] = await Promise.all([
        Dealer.get(dealerId),
        DealerDocument.filter({ dealer_id: dealerId })
      ]);
      setDealer(dealerData);
      setDocuments(docData);
      if (docData.length > 0) {
        setSelectedDocument(docData[0]);
      }
    } catch (error) {
      console.error("Error loading KYB data:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Show KYB queue if no dealerId is provided
  if (!dealerId) {
    return (
      <div className="p-4 md:p-8 bg-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('AdminDashboard'))}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">KYB Queue</h1>
                <p className="text-slate-600">Pending dealer verifications</p>
              </div>
            </div>
          </div>

          {/* KYB Queue List */}
          <div className="grid gap-4">
            {kybQueue.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending KYBs</h3>
                  <p className="text-slate-600">All dealer verifications are up to date.</p>
                </CardContent>
              </Card>
            ) : (
              kybQueue.map((dealer) => (
                <Card key={dealer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{dealer.business_name || dealer.name}</h3>
                                                     <p className="text-slate-600">{dealer.email}</p>
                           <div className="text-sm text-slate-500">
                             Status: <Badge variant="outline">{dealer.verification_status}</Badge>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`${createPageUrl('AdminKYBVerification')}?dealerId=${dealer.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl">Dealer not found.</h1>
        <Link to={createPageUrl('AdminDashboard')} className="text-blue-600">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8 bg-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('AdminDashboard'))}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">KYB Review</h1>
                <p className="text-slate-600">Reviewing: {dealer.business_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700" onClick={handleOpenRejectModal}>
                <XCircle className="w-4 h-4 mr-2" /> Reject (<span className="font-mono text-xs">R</span>)
              </Button>
               <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => handleAction('escalate', 'Escalated for further investigation.')}>
                <AlertTriangle className="w-4 h-4 mr-2" /> Escalate
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                <CheckCircle className="w-4 h-4 mr-2" /> Approve (<span className="font-mono text-xs">A</span>)
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel: Info & Docs */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Dealer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Owner:</strong> {dealer.owner_name}</p>
                  <p><strong>GSTIN:</strong> {dealer.gstin}</p>
                  <p><strong>PAN:</strong> {dealer.pan_number}</p>
                  <p><strong>Phone:</strong> {dealer.phone}</p>
                  <p><strong>Address:</strong> {dealer.address}, {dealer.city}, {dealer.state}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Submitted Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {documents.map(doc => (
                      <li key={doc.id}>
                        <button 
                          className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${selectedDocument?.id === doc.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50'}`}
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <span className="font-medium">{doc.document_type.replace('_', ' ')}</span>
                          <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>{doc.status}</Badge>
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Document Viewer */}
            <div className="lg:col-span-2">
              <Card className="h-[75vh]">
                <CardHeader>
                  <CardTitle>Document Viewer</CardTitle>
                  <CardDescription>
                    {selectedDocument ? `Viewing: ${selectedDocument.file_name}` : 'Select a document to view'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-full pb-16">
                  {selectedDocument ? (
                    (() => {
                      const url: string = selectedDocument.file_url || '';
                      const name: string = selectedDocument.file_name || '';
                      const lower = `${url} ${name}`.toLowerCase();
                      const isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp');
                      const isPdf = lower.endsWith('.pdf');
                      if (isImage) {
                        return (
                          <img
                            src={selectedDocument.file_url}
                            alt={selectedDocument.file_name}
                            className="max-h-full max-w-full object-contain w-full h-full border rounded-md bg-white"
                          />
                        );
                      }
                      if (isPdf) {
                        return (
                          <iframe
                            src={selectedDocument.file_url}
                            title={selectedDocument.file_name}
                            className="w-full h-full border rounded-md"
                          />
                        );
                      }
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-md">
                          <p className="text-slate-600 mb-3">Preview not available. Download to view.</p>
                          <a href={selectedDocument.file_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open Document</a>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-md">
                      <ShieldCheck className="w-24 h-24 text-slate-300" />
                      <p className="mt-4 text-slate-500">Select a document from the left to begin review.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={isRejecting} onOpenChange={setIsRejecting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYB Application</DialogTitle>
            <DialogDescription>
              Please provide a clear reason for rejection. This will be shared with the dealer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea 
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., PAN card is not legible, Address proof is outdated."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejecting(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                handleAction('reject', rejectionReason);
                setIsRejecting(false);
              }}
              disabled={!rejectionReason}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
