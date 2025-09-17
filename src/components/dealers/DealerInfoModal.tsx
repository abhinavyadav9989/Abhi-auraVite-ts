import React, { useEffect, useMemo, useState } from 'react';
import { Dealer, Vehicle, DealerRating, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Star, MapPin, Phone, Users, Building2 } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

type Props = {
  dealerId: string;
  open: boolean;
  onClose: () => void;
};

export default function DealerInfoModal({ dealerId, open, onClose }: Props) {
  const [dealer, setDealer] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [yourRating, setYourRating] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!open || !dealerId) return;
    (async () => {
      setLoading(true);
      try {
        const [d, inv, sessionUser] = await Promise.all([
          Dealer.get(dealerId),
          Vehicle.filter({ dealer_id: dealerId }).catch(() => []),
          User.getCurrentUser().catch(() => null)
        ]);

        setDealer(d);
        setInventory(inv || []);

        // Fetch branches for this dealer
        const { data: branchesData, error: branchesError } = await supabase
          .from('branches')
          .select('*')
          .eq('dealer_id', dealerId)
          .order('created_at', { ascending: true });

        if (branchesError) {
          console.error('Error loading branches:', branchesError);
          setBranches([]);
        } else {
          setBranches(branchesData || []);
        }

        const revs = await DealerRating.filter({ rated_dealer_id: dealerId }).catch(() => []);
        setReviews(revs || []);

        if (sessionUser) {
          const me = await Dealer.filter({ created_by: sessionUser.email }).catch(() => []);
          const currentDealer = Array.isArray(me) && me.length > 0 ? me[0] : null;
          if (currentDealer) {
            const mine = await DealerRating.filter({ rated_dealer_id: dealerId, rater_dealer_id: currentDealer.id }).catch(() => []);
            setYourRating(Array.isArray(mine) && mine.length > 0 ? mine[0] : null);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [open, dealerId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-start justify-center">
        <div className="w-full max-w-4xl rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h2 className="text-xl font-bold">Dealer Profile</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>

          <div className="p-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="branches">Branches</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{dealer?.business_name || 'Dealer'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4" /> {dealer?.city}, {dealer?.state}
                    </div>
                    {dealer?.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Phone className="w-4 h-4" /> {dealer.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{Number(dealer?.rating_avg || 0).toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-slate-500">({dealer?.rating_count || 0} reviews)</span>
                    </div>
                    {yourRating && (
                      <div className="text-xs text-slate-500">Your rating: {yourRating.overall}/5</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="branches" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Branches ({branches.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {branches.length === 0 ? (
                      <div className="text-sm text-slate-600">No branches listed.</div>
                    ) : (
                      <div className="space-y-3">
                        {branches.map((branch: any) => (
                          <div key={branch.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <Building2 className="w-5 h-5 text-slate-500 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {branch.name}
                                  {branch.is_default && (
                                    <Badge variant="secondary" className="ml-2 text-xs">Main</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {branch.address}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    {branch.city}, {branch.state}
                                  </div>
                                  {branch.contact_number && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Phone className="w-3 h-3" />
                                      <span className="text-xs">{branch.contact_number}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Inventory ({inventory.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {inventory.length === 0 ? (
                      <div className="text-sm text-slate-500">No inventory available.</div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {inventory.slice(0, 12).map((v) => (
                          <div key={v.id} className="border border-slate-200 dark:border-slate-700 rounded p-2">
                            <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded mb-2">
                              {v.images?.[0] && <img src={v.images[0]} alt="" className="w-full h-full object-cover rounded" />}
                            </div>
                            <div className="text-sm font-medium">{v.year} {v.make} {v.model}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-bold">{Number(dealer?.rating_avg || 0).toFixed(1)}</span>
                      <span className="text-sm text-slate-500">({dealer?.rating_count || 0})</span>
                    </div>
                    {reviews.length === 0 ? (
                      <div className="text-sm text-slate-500">No reviews yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((r) => (
                          <div key={r.id} className="border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className={`w-4 h-4 ${i <= (r.overall || 0) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                              ))}
                              <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                            {r.comment && <div className="text-sm mt-1">{r.comment}</div>}
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
      </div>
    </div>
  );
}


