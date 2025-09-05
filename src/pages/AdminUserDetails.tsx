import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { Dealer, DealerDocument } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { branchAPI } from '@/api/onboardingAPI';
import { ArrowLeft, Mail, Phone, Building2, FileText, MapPin, CheckCircle, Clock, User as UserIcon, Car } from 'lucide-react';

export default function AdminUserDetails() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const userId = params.get('userId') || '';
  const dealerIdParam = params.get('dealerId') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dealer, setDealer] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        
        let d: any = null;
        try {
          if (dealerIdParam) {
            console.log('Fetching dealer with ID:', dealerIdParam);
            d = await Dealer.get(dealerIdParam);
            console.log('Dealer data:', d);
          }
        } catch (err) {
          console.error('Error fetching dealer:', err);
        }

        // Get user information from dealer's owner_user_id
        let u: any = null;
        try {
          if (d?.owner_user_id) {
            const { data: userData, error } = await supabase.auth.admin.getUserById(d.owner_user_id);
            if (!error && userData?.user) {
              u = userData.user;
            }
          }
        } catch {}

        let docs: any[] = [];
        try {
          if (d?.id) {
            docs = await DealerDocument.filter({ dealer_id: d.id });
          }
        } catch {}

        let brs: any[] = [];
        try {
          if (d?.id) {
            console.log('Fetching branches for dealer ID:', d.id);
            
            // For now, we'll show a message that branches exist but can't be displayed due to permissions
            // This is a temporary workaround until RLS policies are updated for admin users
            console.log('Branches query blocked by RLS - admin permissions needed');
            
            // TODO: Update RLS policies to allow admin users to access branches table
            // For now, we'll show that branches exist but can't be fetched
            brs = []; // Empty array for now
          }
        } catch (err) {
          console.error('Exception fetching branches:', err);
        }

        let inv: any[] = [];
        try {
          if (d?.id) {
            const { data } = await supabase.from('vehicles').select('*').eq('dealer_id', d.id);
            inv = data || [];
          }
        } catch {}

        if (!isMounted) return;
        setUser(u);
        setDealer(d);
        setDocuments(docs);
        setBranches(brs);
        setInventory(inv);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (userId || dealerIdParam) load();
    return () => { isMounted = false; };
  }, [userId, dealerIdParam]);

  if (!(userId || dealerIdParam)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-slate-700 dark:text-slate-300">Missing identifier (userId or dealerId)</p>
          <Button variant="ghost" onClick={() => navigate(createPageUrl('AdminUsers'))} className="mt-2">Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('AdminUsers'))}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Details</h1>
              <p className="text-slate-600 dark:text-slate-300">Complete profile, documents and branches</p>
            </div>
          </div>
          {dealer && (
            <Badge>{dealer?.verification_status || 'dealer'}</Badge>
          )}
        </div>

        <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="h-20 animate-pulse bg-slate-200 dark:bg-slate-800 rounded" />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{dealer?.business_name || 'Dealer'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4" />
                    <span>{dealer?.city}, {dealer?.state}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4" />
                    <span>Created: {dealer?.created_at ? new Date(dealer.created_at).toLocaleDateString() : '-'}</span>
                  </div>
                  {dealer && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Status: {dealer?.verification_status || 'n/a'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-4">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Full Name</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {user?.user_metadata?.full_name || dealer?.owner_name || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Email</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {user?.email || dealer?.email || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Phone</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {user?.phone || dealer?.phone || dealer?.contact_number || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Join Date</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 
                         dealer?.created_at ? new Date(dealer.created_at).toLocaleDateString() : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Role</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {user?.user_metadata?.role || 'Dealer'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Status</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {user?.email_confirmed_at ? 'Active' : 'Pending Verification'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4" /> Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-sm text-slate-500">No documents found.</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {documents.map((doc) => {
                      const lower = `${(doc.file_url||'')} ${(doc.file_name||'')}`.toLowerCase();
                      const isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp');
                      const isPdf = lower.endsWith('.pdf');
                      return (
                        <div key={doc.id} className="p-3 border rounded-lg dark:border-slate-700">
                          <div className="text-sm font-medium text-slate-900 dark:text-white mb-2">{doc.document_type?.replace('_',' ') || 'Document'}</div>
                          <div className="h-48 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                            {isImage ? (
                              <img src={doc.file_url} alt={doc.file_name} className="max-h-full max-w-full object-contain" />
                            ) : isPdf ? (
                              <iframe src={doc.file_url} title={doc.file_name} className="w-full h-full" />
                            ) : (
                              <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-blue-600">Open</a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branches">
            <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Branches</CardTitle>
              </CardHeader>
              <CardContent>
                {branches.length === 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Branches data unavailable.</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Admin permissions are required to view branch information. The RLS policies need to be updated to allow admin users to access the branches table.
                    </div>
                    {dealer && (
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        Dealer ID: {dealer.id}
                      </div>
                    )}
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                      <strong>Note:</strong> This dealer may have branches, but they cannot be displayed due to database permission restrictions.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {branches.map((b: any) => (
                      <div key={b.id} className="p-3 border rounded-lg dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-slate-900 dark:text-white">{b.name || 'Branch'}</div>
                          {b.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">{b.city}, {b.state}</div>
                        {b.address && (
                          <div className="text-sm text-slate-500 dark:text-slate-400">{b.address}</div>
                        )}
                        {b.contact_number && (
                          <div className="text-sm text-slate-500 dark:text-slate-400">Phone: {b.contact_number}</div>
                        )}
                        {b.dealer_name && (
                          <div className="text-xs text-slate-400 dark:text-slate-500">Dealer: {b.dealer_name}</div>
                        )}
                        {b.created_at && (
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            Created: {new Date(b.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Car className="w-4 h-4" /> Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                {inventory.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">No vehicles in inventory.</div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inventory.map((vehicle: any) => (
                      <div key={vehicle.id} className="p-4 border rounded-lg dark:border-slate-700">
                        <div className="space-y-2">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {vehicle.make} {vehicle.model} {vehicle.year}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {vehicle.variant || 'Standard'}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            VIN: {vehicle.vin || 'N/A'}
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                              {vehicle.status || 'Unknown'}
                            </Badge>
                            {vehicle.asking_price && (
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                ₹{vehicle.asking_price.toLocaleString()}
                              </div>
                            )}
                          </div>
                          {vehicle.odometer_reading && (
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {vehicle.odometer_reading.toLocaleString()} km
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


