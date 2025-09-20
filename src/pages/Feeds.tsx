import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Dealer as DealerEntity } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Image as ImageIcon, Video, Loader2, Send, MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type FeedMedia = {
  id: string;
  post_id: string;
  media_type: 'image' | 'video' | string;
  file_url: string;
  thumb_url?: string | null;
  sort_order?: number | null;
};

type FeedPost = {
  id: string;
  dealer_id: string | null;
  user_id: string | null;
  content: string | null;
  created_at: string;
  media_count: number | null;
  feeds_media?: FeedMedia[];
  dealer?: { id: string; business_name: string | null; name: string | null; logo_url?: string | null } | null;
};

export default function Feeds() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'public' | 'mine'>('public');
  const [composerText, setComposerText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const myId = auth.user?.id || '';
      let query = supabase
        .from('feeds_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (activeTab === 'mine') {
        query = query.eq('user_id', myId);
      }

      const { data, error } = await query;
      if (error) throw error;
      const base = (data || []) as FeedPost[];

      // Attach media explicitly to avoid depending on PostgREST relationship naming
      const postIds = base.map(p => p.id);
      let mediaByPost: Record<string, FeedMedia[]> = {};
      if (postIds.length > 0) {
        const { data: mediaRows } = await supabase
          .from('feeds_media')
          .select('*')
          .in('post_id', postIds);
        (mediaRows || []).forEach((m: any) => {
          if (!mediaByPost[m.post_id]) mediaByPost[m.post_id] = [];
          mediaByPost[m.post_id].push(m);
        });
      }
      // Hydrate dealer names in a follow-up query (robust to FK/alias issues)
      const dealerIds = Array.from(new Set(base.map(p => p.dealer_id).filter(Boolean))) as string[];
      let dealerMap: Record<string, { id: string; business_name: string | null; name: string | null; logo_url: string | null }> = {};
      if (dealerIds.length > 0) {
        const { data: dealers } = await supabase
          .from('dealers')
          .select('id,business_name,name,logo_url')
          .in('id', dealerIds);
        (dealers || []).forEach((d: any) => { dealerMap[d.id] = d; });
      }
      const hydrated = base.map(p => ({
        ...p,
        dealer: p.dealer_id ? dealerMap[p.dealer_id] || null : null,
        feeds_media: mediaByPost[p.id] || [],
      }));

      // If my own posts still lack dealer (older posts), hydrate with my dealer best-effort
      const myDealer = currentUserId ? await (async () => {
        try {
          const rows = await DealerEntity.filter({ created_by: (await supabase.auth.getUser()).data.user?.email || '' });
          return rows?.[0] || null;
        } catch { return null; }
      })() : null;
      const hydratedWithMine = hydrated.map(p => (!p.dealer && p.user_id === currentUserId && myDealer)
        ? { ...p, dealer: { id: myDealer.id, business_name: myDealer.business_name, name: myDealer.name, logo_url: myDealer.logo_url } }
        : p
      );
      setPosts(hydratedWithMine);
    } catch (e) {
      console.error('Failed loading posts', e);
      toast({ title: 'Failed to load posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, [activeTab]);
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setCurrentUserId(auth.user?.id || null);
    })();
  }, []);

  const onPickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const picked = Array.from(e.target.files).slice(0, 6);
    setFiles(picked);
    // Build local previews using data URLs to avoid CSP issues with blob: on some hosts
    try {
      Promise.all(
        picked.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      )
        .then((urls) => setPreviews(urls))
        .catch(() => setPreviews([]));
    } catch {
      setPreviews([]);
    }
  };

  const canShare = composerText.trim().length > 0 || files.length > 0;

  const sharePost = async () => {
    if (!canShare || isSharing) return;
    setIsSharing(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user?.id) throw new Error('Not authenticated');

      // Resolve dealer_id for current user (best-effort)
      let dealerId: string | null = null;
      try {
        // Prefer using existing entity adapter to match Dashboard behavior
        const rows = await DealerEntity.filter({ created_by: auth.user.email || '' });
        if (rows && rows[0]?.id) {
          dealerId = rows[0].id;
        } else {
          // Fallback direct query by owner_user_id
          const { data: dealerRows2 } = await supabase
            .from('dealers')
            .select('id')
            .eq('owner_user_id', auth.user.id)
            .limit(1);
          dealerId = dealerRows2 && dealerRows2[0]?.id ? dealerRows2[0].id : null;
        }
      } catch {}

      // 1) Create post first (media uploaded after with reference)
      const { data: post, error: postErr } = await supabase
        .from('feeds_posts')
        .insert([{ content: composerText || null, user_id: auth.user.id, dealer_id: dealerId, media_count: files.length }])
        .select('*')
        .single();
      if (postErr) throw postErr;

      // 2) Upload media if any
      let uploaded = 0;
      const uploadedMedia: FeedMedia[] = [];
      // Prefer env bucket, then sensible fallbacks
      const bucketCandidates = Array.from(
        new Set([
          (import.meta as any)?.env?.VITE_FEED_BUCKET,
          'feed-media',
          'feed-storage',
        ].filter(Boolean))
      ) as string[];
      const uploadToAnyBucket = async (file: File, path: string): Promise<{ ok: boolean; publicUrl?: string; bucket?: string; error?: any }> => {
        for (const b of bucketCandidates) {
          const { error } = await supabase.storage.from(b).upload(path, file, { upsert: false });
          if (!error) {
            const { data } = supabase.storage.from(b).getPublicUrl(path);
            return { ok: true, publicUrl: data.publicUrl, bucket: b };
          }
          // Only fall through on bucket not found or conflict; try next
          if (error?.message && !/bucket/i.test(error.message)) return { ok: false, error };
        }
        return { ok: false, error: new Error('No working storage bucket found. Create feed-storage or feed-media as public.') };
      };
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const path = `${auth.user.id}/${post.id}/${Date.now()}_${i}_${f.name}`;
        const upRes = await uploadToAnyBucket(f, path);
        if (!upRes.ok || !upRes.publicUrl) {
          console.error('Upload error:', upRes.error);
          continue;
        }
        const { data: inserted, error: insErr } = await supabase
          .from('feeds_media')
          .insert([{ post_id: post.id, media_type: f.type.startsWith('video') ? 'video' : 'image', file_url: upRes.publicUrl, sort_order: i }])
          .select('*')
          .single();
        if (!insErr && inserted) uploadedMedia.push(inserted as any);
        uploaded++;
      }

      if (uploaded !== files.length) {
        try { await supabase.from('feeds_posts').update({ media_count: uploaded }).eq('id', post.id); } catch {}
      }

      // 3) Optimistic UI
      setPosts(prev => [{ ...post, feeds_media: uploadedMedia }, ...prev]);
      toast({ title: uploaded === files.length ? 'Shared!' : 'Shared (some files failed to upload)' });
    } catch (e) {
      console.error('Share failed', e);
      // If bucket is missing, guide the user
      const msg = (e as any)?.message || '';
      if (msg.toLowerCase().includes('bucket') || msg.toLowerCase().includes('not found')) {
        toast({ title: 'Storage bucket missing', description: 'Create a public bucket named "feed-storage" in Supabase Storage (public read).', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to share', variant: 'destructive' });
      }
    } finally {
      setIsSharing(false);
      // Always reset composer UI so selections don’t stick around
      setComposerText('');
      setFiles([]);
      setPreviews([]);
      try { if (fileInputRef.current) fileInputRef.current.value = ''; } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Composer */}
        <Card className="rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              
              <div className="flex-1">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
                <textarea
                  placeholder="Write something here..."
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  className="w-full resize-none bg-transparent outline-none text-sm md:text-base placeholder:text-slate-400 min-h-[56px]"
                />
                {files.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative overflow-hidden rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                        {files[i]?.type?.startsWith('video') ? (
                          <video src={src} className="w-full h-24 object-cover" />
                        ) : (
                          <img src={src} className="w-full h-24 object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onPickFiles} className="gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Photo/Video
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={onFilesSelected} />
                  </div>
                  <Button onClick={sharePost} disabled={!canShare || isSharing} className="gap-2">
                    {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-white/70 dark:bg-slate-900/60">
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="mine">Your posts</TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="mt-4">
            <FeedList 
              posts={posts} 
              loading={loading}
              currentUserId={currentUserId}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              editingPostId={editingPostId}
              setEditingPostId={setEditingPostId}
              editText={editText}
              setEditText={setEditText}
              onSaveEdit={async (id, text) => {
                try {
                  await supabase.from('feeds_posts').update({ content: text }).eq('id', id);
                  setPosts(prev => prev.map(p => p.id === id ? { ...p, content: text } : p));
                  setEditingPostId(null);
                } catch {
                  toast({ title: 'Failed to update post', variant: 'destructive' });
                }
              }}
              onDelete={async (id) => {
                try {
                  await supabase.from('feeds_posts').delete().eq('id', id);
                  setPosts(prev => prev.filter(p => p.id !== id));
                } catch {
                  toast({ title: 'Failed to delete post', variant: 'destructive' });
                }
              }}
            />
          </TabsContent>
          <TabsContent value="mine" className="mt-4">
            <FeedList 
              posts={posts} 
              loading={loading}
              currentUserId={currentUserId}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              editingPostId={editingPostId}
              setEditingPostId={setEditingPostId}
              editText={editText}
              setEditText={setEditText}
              onSaveEdit={async (id, text) => {
                try {
                  await supabase.from('feeds_posts').update({ content: text }).eq('id', id);
                  setPosts(prev => prev.map(p => p.id === id ? { ...p, content: text } : p));
                  setEditingPostId(null);
                } catch {
                  toast({ title: 'Failed to update post', variant: 'destructive' });
                }
              }}
              onDelete={async (id) => {
                try {
                  await supabase.from('feeds_posts').delete().eq('id', id);
                  setPosts(prev => prev.filter(p => p.id !== id));
                } catch {
                  toast({ title: 'Failed to delete post', variant: 'destructive' });
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FeedList({ posts, loading, currentUserId, menuOpenId, setMenuOpenId, editingPostId, setEditingPostId, editText, setEditText, onSaveEdit, onDelete }: {
  posts: FeedPost[];
  loading: boolean;
  currentUserId: string | null;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  editingPostId: string | null;
  setEditingPostId: (id: string | null) => void;
  editText: string;
  setEditText: (t: string) => void;
  onSaveEdit: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading posts...
      </div>
    );
  }
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">No posts yet.</div>
    );
  }
  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <Card key={p.id} className="rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={p.dealer?.logo_url || ''} />
                <AvatarFallback>{((p.dealer?.business_name || p.dealer?.name || 'D') as string).slice(0,1)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.dealer?.business_name || p.dealer?.name || 'Business'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</div>
                  </div>
                  <div className="relative">
                    <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}>
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {menuOpenId === p.id && (
                      <div className="absolute right-0 mt-2 w-32 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-10">
                        {p.user_id === currentUserId ? (
                          <>
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => { setEditingPostId(p.id); setEditText(p.content || ''); setMenuOpenId(null); }}>Edit</button>
                            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => { setMenuOpenId(null); onDelete(p.id); }}>Delete</button>
                          </>
                        ) : (
                          <div className="px-3 py-2 text-sm text-slate-500">No actions</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Post body below header so it aligns with card padding (no avatar offset) */}
            <div className="mt-2 w-full px-0">
                  {/* Media first - square like Instagram */}
                  {Array.isArray(p.feeds_media) && p.feeds_media.length > 0 && (
                    <div className="mt-2 w-full aspect-square overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                      {(() => {
                        const m = [...p.feeds_media].sort((a,b) => (a.sort_order||0)-(b.sort_order||0))[0];
                        return m.media_type === 'video' ? (
                          <video controls className="w-full h-full object-cover">
                            <source src={m.file_url} />
                          </video>
                        ) : (
                          <img src={m.file_url} alt="post" className="w-full h-full object-cover" />
                        );
                      })()}
                    </div>
                  )}

                  {/* Action bar */}
                  <div className="mt-3 flex items-center gap-5 text-slate-700 dark:text-slate-300">
                    <button className="hover:opacity-80" aria-label="Like"><Heart className="w-5 h-5" /></button>
                    <button className="hover:opacity-80" aria-label="Comment"><MessageCircle className="w-5 h-5" /></button>
                  </div>

                  {/* Likes count */}
                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">0 likes</div>

                  {/* Caption (business name bold + text) */}
                  {editingPostId === p.id ? (
                    <div className="mt-2">
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full resize-none bg-transparent outline-none text-sm md:text-base border rounded-md p-2 border-slate-200 dark:border-slate-700" />
                      <div className="mt-2 flex items-center gap-2">
                        <Button size="sm" onClick={() => onSaveEdit(p.id, editText)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingPostId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    p.content && (
                      <div className="mt-2 text-slate-900 dark:text-slate-100 text-sm md:text-base">
                        <span className="font-semibold mr-2">{p.dealer?.business_name || p.dealer?.name || 'Business'}</span>
                        <span className="whitespace-pre-wrap">{p.content}</span>
                      </div>
                    )
                  )}

                  {/* View comments link */}
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">View all 0 comments</div>

                  {/* Timestamp */}
                  <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</div>
                </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


