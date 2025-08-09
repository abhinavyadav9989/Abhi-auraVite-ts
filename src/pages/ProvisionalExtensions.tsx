
import React, { useState, useEffect } from 'react';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities'; // Import User
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { createPageUrl } from '@/utils'; // Import createPageUrl
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, ThumbsUp, ThumbsDown, User as UserIcon, Building2 } from 'lucide-react'; // Renamed User to UserIcon to avoid conflict with imported User entity
import { format, addDays } from 'date-fns';

export default function ProvisionalExtensions() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        if (user.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You do not have permission to view this page.",
            variant: "destructive",
          });
          navigate(createPageUrl('Dashboard'));
          return;
        }
        await loadRequests();
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          variant: "destructive",
        });
        navigate(createPageUrl('Dashboard'));
      }
      setIsLoading(false);
    };
    checkAdminAndLoad();
  }, [navigate, toast]); // Add navigate and toast to dependency array

  const loadRequests = async () => {
    // setIsLoading(true); // Now handled in effect
    try {
      const extensionRequests = await Dealer.filter({ 
        extension_requested: true,
        verification_status: 'provisional' 
      });
      setRequests(extensionRequests);
    } catch (error) {
      console.error("Error loading extension requests:", error);
      toast({ title: "Error", description: "Could not load requests.", variant: "destructive" });
    }
    // setIsLoading(false); // Now handled in effect
  };

  const handleAction = async (dealerId, action) => {
    try {
      const dealer = requests.find(r => r.id === dealerId);
      if (!dealer) return;

      if (action === 'grant') {
        const newExpiry = addDays(new Date(dealer.provisional_until), 15);
        await Dealer.update(dealerId, {
          provisional_until: newExpiry.toISOString(),
          extension_count: (dealer.extension_count || 0) + 1,
          extension_requested: false,
          verification_notes: `Extension granted until ${format(newExpiry, 'PPP')}.`
        });
        toast({ title: "Extension Granted", description: `${dealer.business_name}'s access extended by 15 days.`});
      } else { // deny
        await Dealer.update(dealerId, {
          extension_requested: false,
          verification_notes: `Extension request on ${format(new Date(), 'PPP')} was denied.`
        });
        toast({ title: "Extension Denied", description: `${dealer.business_name}'s request has been denied.`, variant: "destructive" });
      }
      loadRequests(); // Refresh the list
    } catch (error) {
       console.error(`Error handling action ${action}:`, error);
       toast({ title: "Error", description: "Action could not be completed.", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Provisional Access Extensions
            </h1>
            <p className="text-slate-600">
              Review and approve/deny requests for extended provisional access.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No pending extension requests.</div>
            ) : (
              <div className="space-y-4">
                {requests.map(dealer => (
                  <div key={dealer.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        <p className="font-bold text-lg">{dealer.business_name}</p>
                      </div>
                      <div className="text-sm text-slate-600 mt-1 space-x-4">
                        <span><span className="font-medium">Expires:</span> {format(new Date(dealer.provisional_until), 'PPP')}</span>
                        <span><span className="font-medium">Extensions Used:</span> {dealer.extension_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction(dealer.id, 'deny')}>
                        <ThumbsDown className="w-4 h-4 mr-2" /> Deny
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(dealer.id, 'grant')}>
                        <ThumbsUp className="w-4 h-4 mr-2" /> Grant 15 Days
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
