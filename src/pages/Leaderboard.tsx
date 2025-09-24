import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Dealer as DealerEntity, Vehicle as VehicleEntity, DealerRating as DealerRatingEntity, User as UserEntity } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { INDIAN_STATES } from '@/constants/indianStates';
import { useSearchParams } from 'react-router-dom';

type LeaderMetric = 'overall' | 'rating' | 'reviews' | 'sold' | 'purchased';

export default function Leaderboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'public' | 'rank'>('public');
  const [metric, setMetric] = useState<LeaderMetric>('overall');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [rows, setRows] = useState<any[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use canonical India states for filter to prevent typos
    setStates(INDIAN_STATES);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Minimal client-side aggregation for MVP; can be replaced with SQL views later
        const { data: dealers } = await supabase.from('dealers').select('id,business_name,name,logo_url,state');
        const dealerMap = new Map<string, any>();
        (dealers || []).forEach((d: any) => dealerMap.set(d.id, { ...d, rating: 0, reviews: 0, sold: 0, purchased: 0, amount_received: 0, amount_spent: 0 }));

        // Ratings
        try {
          const ratings = await DealerRatingEntity.filter({});
          ratings.forEach((r: any) => {
            const row = dealerMap.get(r.rated_dealer_id);
            if (row) {
              row.reviews += 1;
              row.rating_sum = (row.rating_sum || 0) + (r.overall || 0);
            }
          });
          dealerMap.forEach((row) => {
            row.rating = row.reviews > 0 ? (row.rating_sum || 0) / row.reviews : 0;
          });
        } catch {}

        // Load transaction data for sold/purchased counts and amounts
        try {
          const { data: transactions } = await supabase
            .from('transactions')
            .select('seller_id, buyer_id, amount, status')
            .in('status', ['completed', 'accepted']);
          
          (transactions || []).forEach((t: any) => {
            // Count sold vehicles and amount received
            const seller = dealerMap.get(t.seller_id);
            if (seller) {
              seller.sold += 1;
              seller.amount_received += t.amount || 0;
            }
            
            // Count purchased vehicles and amount spent
            const buyer = dealerMap.get(t.buyer_id);
            if (buyer) {
              buyer.purchased += 1;
              buyer.amount_spent += t.amount || 0;
            }
          });
        } catch {}

        let list = Array.from(dealerMap.values());
        if (stateFilter !== 'ALL') list = list.filter(r => (r.state || '').toLowerCase() === stateFilter.toLowerCase());

        const score = (r: any) => (r.rating * 10) + r.reviews + (r.sold * 2) + r.purchased;

        list.sort((a, b) => {
          if (metric === 'rating') return (b.rating || 0) - (a.rating || 0);
          if (metric === 'reviews') return (b.reviews || 0) - (a.reviews || 0);
          if (metric === 'sold') return (b.sold || 0) - (a.sold || 0);
          if (metric === 'purchased') return (b.purchased || 0) - (a.purchased || 0);
          return score(b) - score(a);
        });

        setRows(list);
      } catch (e) {
        console.error('Load leaderboard failed', e);
        toast({ title: 'Failed to load leaderboard', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, [metric, stateFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-white/70 dark:bg-slate-900/60">
            <TabsTrigger value="public">Public Profile</TabsTrigger>
            <TabsTrigger value="rank">Your Rank</TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="mt-4">
            {/* Minimal public profile using current user dealer */}
            <PublicProfileEmbed />
          </TabsContent>

          <TabsContent value="rank" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant={metric==='overall'?'default':'outline'} size="sm" onClick={() => setMetric('overall')}>Overall</Button>
                  <Button variant={metric==='rating'?'default':'outline'} size="sm" onClick={() => setMetric('rating')}>Rating</Button>
                  <Button variant={metric==='reviews'?'default':'outline'} size="sm" onClick={() => setMetric('reviews')}>Reviews</Button>
                  <Button variant={metric==='sold'?'default':'outline'} size="sm" onClick={() => setMetric('sold')}>Sold</Button>
                  <Button variant={metric==='purchased'?'default':'outline'} size="sm" onClick={() => setMetric('purchased')}>Purchased</Button>
                </div>
                <div className="w-44 relative z-10">
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter state" /></SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="ALL">All India</SelectItem>
                      {states.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <RankList rows={rows} loading={loading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RankList({ rows, loading }: { rows: any[]; loading: boolean }) {
  if (loading) return <div className="p-6 text-slate-500">Loading...</div>;
  if (!rows || rows.length === 0) return <div className="p-6 text-slate-500">No data.</div>;
  return (
    <div className="space-y-2">
      {rows.slice(0, 50).map((r, i) => (
        <Card key={r.id}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 text-center font-semibold">{i+1}</div>
              <Avatar className="h-8 w-8">
                {r.logo_url ? <img src={r.logo_url} className="h-8 w-8 object-cover" /> : <AvatarFallback>{(r.business_name || r.name || 'D').slice(0,1)}</AvatarFallback>}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{r.business_name || r.name || 'Dealer'}</div>
                <div className="text-xs text-slate-500">{r.state || '—'}</div>
              </div>
              <div className="text-right text-sm">
                <div>⭐ {Number(r.rating||0).toFixed(1)} ({r.reviews||0})</div>
                <div className="text-xs text-slate-500">Sold {r.sold||0} • Bought {r.purchased||0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PublicProfileEmbed() {
  const [searchParams] = useSearchParams();
  const [dealer, setDealer] = useState<any>(null);
  const [kpis, setKpis] = useState<any>({ rating: 0, reviews: 0, sold: 0, purchased: 0, amount_received: 0, amount_spent: 0, rank_india: 0, rank_state: 0 });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        let dealerId = searchParams.get('dealerId');
        let currentDealer: any = null;
        if (!dealerId) {
          // Fallback to current user's dealer
          try {
            const me = await UserEntity.me();
            const list = await DealerEntity.filter({ created_by: me.email });
            dealerId = list?.[0]?.id || null;
            if (list && list[0]) currentDealer = list[0];
          } catch {}
        }
        if (!dealerId) return;
        
        // First try with entity adapter
        const d = await DealerEntity.get(dealerId);
        console.log('Leaderboard - Dealer data from entity:', d);
        console.log('Leaderboard - Banner URL from entity:', d?.banner_url);
        if (!currentDealer) currentDealer = d;
        
        // If banner_url is missing, try direct Supabase query to get all fields
        if (!d?.banner_url) {
          try {
            const { data: directData, error } = await supabase
              .from('dealers')
              .select('*')
              .eq('id', dealerId)
              .single();
            
            if (!error && directData) {
              console.log('Leaderboard - Direct dealer data:', directData);
              console.log('Leaderboard - Direct banner URL:', directData?.banner_url);
              setDealer(directData);
              currentDealer = directData;
            } else {
              console.error('Leaderboard - Direct query error:', error);
              setDealer(d);
            }
          } catch (directError) {
            console.error('Leaderboard - Direct query exception:', directError);
            setDealer(d);
            currentDealer = d;
          }
        } else {
          setDealer(d);
          currentDealer = d;
        }

        // Ratings KPIs
        try {
          const rows = await DealerRatingEntity.filter({ rated_dealer_id: dealerId });
          const reviews = rows.length;
          const rating = reviews ? rows.reduce((s: number, r: any) => s + (r.overall || 0), 0) / reviews : 0;
          setKpis((prev: any) => ({ ...prev, reviews, rating }));
        } catch {}

        // Vehicles inventory
        try {
          const inv = await VehicleEntity.filter({ dealer_id: dealerId, status: 'live' });
          setVehicles(inv || []);
        } catch {}

        // Transaction KPIs for this dealer
        try {
          const { data: soldTxs } = await supabase
            .from('transactions')
            .select('amount')
            .eq('seller_id', dealerId)
            .in('status', ['completed', 'accepted']);
          
          const { data: boughtTxs } = await supabase
            .from('transactions')
            .select('amount')
            .eq('buyer_id', dealerId)
            .in('status', ['completed', 'accepted']);
          
          const sold = (soldTxs || []).length;
          const purchased = (boughtTxs || []).length;
          const amount_received = (soldTxs || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          const amount_spent = (boughtTxs || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          
          setKpis((prev: any) => ({ ...prev, sold, purchased, amount_received, amount_spent }));
        } catch {}

        // Compute India and State ranks using the same scoring as the leaderboard
        try {
          // Load basic dealer list
          const { data: dealers } = await supabase
            .from('dealers')
            .select('id,business_name,name,logo_url,state');

          const dealerMap = new Map<string, any>();
          (dealers || []).forEach((d: any) =>
            dealerMap.set(d.id, {
              ...d,
              rating: 0,
              reviews: 0,
              sold: 0,
              purchased: 0,
            })
          );

          // Ratings aggregation
          try {
            const ratings = await DealerRatingEntity.filter({});
            ratings.forEach((r: any) => {
              const row = dealerMap.get(r.rated_dealer_id);
              if (row) {
                row.reviews += 1;
                row.rating_sum = (row.rating_sum || 0) + (r.overall || 0);
              }
            });
            dealerMap.forEach((row) => {
              row.rating = row.reviews > 0 ? (row.rating_sum || 0) / row.reviews : 0;
            });
          } catch {}

          // Transactions aggregation for sold/purchased
          try {
            const { data: transactions } = await supabase
              .from('transactions')
              .select('seller_id,buyer_id,status')
              .in('status', ['completed', 'accepted']);

            (transactions || []).forEach((t: any) => {
              const seller = dealerMap.get(t.seller_id);
              if (seller) seller.sold += 1;
              const buyer = dealerMap.get(t.buyer_id);
              if (buyer) buyer.purchased += 1;
            });
          } catch {}

          const score = (r: any) => (r.rating * 10) + r.reviews + (r.sold * 2) + r.purchased;

          // All India rank
          const listAll = Array.from(dealerMap.values()).sort((a, b) => score(b) - score(a));
          const indiaIndex = listAll.findIndex((r: any) => r.id === dealerId);

          // State rank (based on dealer's state). Use local currentDealer to avoid state update race.
          const dealerState = ((currentDealer?.state) || '').toLowerCase();
          const listState = Array.from(dealerMap.values())
            .filter((r: any) => (r.state || '').toLowerCase() === dealerState)
            .sort((a, b) => score(b) - score(a));
          const stateIndex = listState.findIndex((r: any) => r.id === dealerId);

          setKpis((prev: any) => ({
            ...prev,
            rank_india: indiaIndex >= 0 ? indiaIndex + 1 : 0,
            rank_state: stateIndex >= 0 ? stateIndex + 1 : 0,
          }));
        } catch {}

        // Feeds posts thumbnails
        try {
          const { data: postsData } = await supabase
            .from('feeds_posts')
            .select('id')
            .eq('dealer_id', dealerId)
            .order('created_at', { ascending: false })
            .limit(12);
          const pids = (postsData || []).map((p: any) => p.id);
          if (pids.length) {
            const { data: media } = await supabase
              .from('feeds_media')
              .select('post_id,file_url,thumb_url,sort_order')
              .in('post_id', pids);
            const firstByPost: Record<string, any> = {};
            (media || []).forEach((m: any) => {
              if (!firstByPost[m.post_id] || (m.sort_order || 0) < (firstByPost[m.post_id].sort_order || 0)) firstByPost[m.post_id] = m;
            });
            setPosts(pids.map((id: string) => ({ id, thumb: firstByPost[id]?.thumb_url || firstByPost[id]?.file_url || '' })));
          }
        } catch {}
      } catch {}
    })();
  }, [searchParams]);

  return (
    <div className="space-y-4">
      {/* Dealer banner */}
      {dealer && (
        <Card className="overflow-hidden">
          <div className="aspect-[3/1] relative bg-gradient-to-r from-blue-600 to-purple-600">
            {dealer.banner_url ? (
              <img 
                src={dealer.banner_url} 
                alt={`${dealer?.business_name || dealer?.name} banner`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">{dealer?.business_name || dealer?.name}</div>
                  <div className="text-lg opacity-90">{dealer?.city}, {dealer?.state}</div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {dealer?.logo_url ? <img src={dealer.logo_url} className="h-12 w-12 object-cover" /> : <AvatarFallback>{(dealer?.business_name || dealer?.name || 'D').slice(0,1)}</AvatarFallback>}
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{dealer?.business_name || dealer?.name || 'Dealer'}</div>
              <div className="text-xs text-slate-500">{dealer?.city || ''}{dealer?.state ? `, ${dealer.state}` : ''}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Sold', value: kpis.sold },
              { label: 'Purchased', value: kpis.purchased },
              { label: 'Rating', value: Number(kpis.rating).toFixed(1) },
              { label: 'Reviews', value: kpis.reviews },
              { label: 'Amount Received', value: `₹${kpis.amount_received}` },
              { label: 'Amount Spent', value: `₹${kpis.amount_spent}` },
              { label: 'All-India Rank', value: kpis.rank_india || '—' },
              { label: 'State Rank', value: kpis.rank_state || '—' },
            ].map((k) => (
              <div key={k.label} className="rounded-lg border p-3 text-center">
                <div className="text-xs text-slate-500">{k.label}</div>
                <div className="text-lg font-semibold">{k.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inventory preview */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 font-semibold">Inventory ({vehicles.length})</div>
          {vehicles.length === 0 ? (
            <div className="text-sm text-slate-500">No live vehicles.</div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {vehicles.slice(0, 6).map((v: any) => {
                const imageUrl = v.hero_image_url || (v.images && v.images.length > 0 ? v.images[0] : null);
                return (
                  <div key={v.id} className="aspect-square rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-800">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={`${v.make} ${v.model} ${v.year}`}
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                      <div className="text-center text-slate-500 dark:text-slate-400">
                        <div className="text-xs font-medium">{v.make}</div>
                        <div className="text-xs">{v.model}</div>
                        <div className="text-xs">{v.year}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feeds posts preview */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 font-semibold">Posts ({posts.length})</div>
          {posts.length === 0 ? (
            <div className="text-sm text-slate-500">No posts yet.</div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.slice(0, 9).map((p: any) => (
                <div key={p.id} className="aspect-square overflow-hidden rounded">
                  <img src={p.thumb} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


