import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Dealer, BankDetails, Transaction, Vehicle } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';
import { CreditCard, Plus, CheckCircle, Building, Edit, Trash2, ShieldCheck, IndianRupee, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type BankForm = {
  bank_name: string;
  account_holder: string;
  account_number: string;
  ifsc: string;
  branch?: string;
  account_type?: string;
};

export default function Bank() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [dealer, setDealer] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [kpis, setKpis] = useState<{ total:number; completed:number; declined:number; spent:number; received:number; net:number; }|null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<{ open: boolean; account: any | null }>({ open: false, account: null });
  const [form, setForm] = useState<BankForm>({ bank_name: '', account_holder: '', account_number: '', ifsc: '', branch: '', account_type: '' });

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const u = await User.me();
        setUser(u);
        const dealerList = await Dealer.filter({ created_by: u.email });
        const d = dealerList[0];
        setDealer(d);
        const accs = await BankDetails.filter({ dealer_id: d.id });
        setAccounts(accs || []);

        let txns = await Transaction.filter({ $or: [{ buyer_id: d.id }, { seller_id: d.id }] });
        txns = txns || [];
        // Enrich with counterparty and vehicle title
        const dealerIds = Array.from(new Set([
          ...txns.map((t:any) => t.buyer_id),
          ...txns.map((t:any) => t.seller_id)
        ].filter(Boolean)));
        const dealerMap: Record<string, any> = {};
        await Promise.all(dealerIds.map(async (id) => {
          try { dealerMap[id] = await Dealer.get(id); } catch {}
        }));
        const vehicleIds = Array.from(new Set(txns.map((t:any) => t.vehicle_id).filter(Boolean)));
        const vehicleMap: Record<string, any> = {};
        await Promise.all(vehicleIds.map(async (vid) => { try { vehicleMap[vid] = await Vehicle.get(vid); } catch {} }));

        const enriched = txns.map((t:any) => {
          const isPurchase = t.buyer_id === d.id;
          const counterpartyId = isPurchase ? t.seller_id : t.buyer_id;
          const counterparty = dealerMap[counterpartyId];
          const vehicle = vehicleMap[t.vehicle_id];
          const amount = Number(t.final_price || t.current_offer || t.amount || 0);
          return {
            ...t,
            type: isPurchase ? 'purchase' : 'sale',
            counterparty_name: counterparty?.business_name || '—',
            seller_id: t.seller_id,
            seller_name: dealerMap[t.seller_id]?.business_name,
            seller_address: dealerMap[t.seller_id] ? `${dealerMap[t.seller_id]?.city || ''}${dealerMap[t.seller_id]?.state ? ', ' + dealerMap[t.seller_id]?.state : ''}` : '—',
            buyer_id: t.buyer_id,
            buyer_name: dealerMap[t.buyer_id]?.business_name,
            buyer_address: dealerMap[t.buyer_id] ? `${dealerMap[t.buyer_id]?.city || ''}${dealerMap[t.buyer_id]?.state ? ', ' + dealerMap[t.buyer_id]?.state : ''}` : '—',
            vehicle_title: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : (t.vehicle_title || t.vehicle_id),
            amount_number: amount
          };
        });

        // newest first
        enriched.sort((a: any, b: any) => new Date(b.transaction_date || b.created_at || 0).getTime() - new Date(a.transaction_date || a.created_at || 0).getTime());
        setTransactions(enriched);

        // KPIs
        const completed = enriched.filter((t:any) => t.status === 'completed');
        const declined = enriched.filter((t:any) => t.status === 'declined');
        const spent = completed.filter((t:any) => t.type === 'purchase').reduce((sum:number, t:any) => sum + (t.amount_number || 0), 0);
        const received = completed.filter((t:any) => t.type === 'sale').reduce((sum:number, t:any) => sum + (t.amount_number || 0), 0);
        setKpis({ total: enriched.length, completed: completed.length, declined: declined.length, spent, received, net: received - spent });
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load bank data', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const primaryId = useMemo(() => (accounts.find(a => a.is_primary)?.id || null), [accounts]);

  const openAdd = () => {
    setForm({ bank_name: '', account_holder: dealer?.business_name || '', account_number: '', ifsc: '', branch: '', account_type: 'current' });
    setShowAdd(true);
  };

  const submitAdd = async () => {
    try {
      const payload: any = {
        dealer_id: dealer.id,
        bank_name: form.bank_name,
        account_holder_name: form.account_holder,
        account_number: form.account_number,
        ifsc_code: form.ifsc,
        branch: form.branch,
        account_type: form.account_type,
        is_primary: accounts.length === 0
      };
      const created = await BankDetails.create(payload);
      setAccounts(prev => [created, ...prev]);
      setShowAdd(false);
      toast({ title: 'Bank Added', description: `${form.bank_name} • ${maskAcc(form.account_number)}` });
    } catch (e) {
      toast({ title: 'Error', description: 'Could not add bank account', variant: 'destructive' });
    }
  };

  const submitEdit = async () => {
    const account = showEdit.account;
    if (!account) return;
    try {
      const updated = await BankDetails.update(account.id, {
        bank_name: form.bank_name,
        account_holder_name: form.account_holder,
        account_number: form.account_number,
        ifsc_code: form.ifsc,
        branch: form.branch,
        account_type: form.account_type
      });
      setAccounts(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      setShowEdit({ open: false, account: null });
      toast({ title: 'Bank Updated', description: `${updated.bank_name}` });
    } catch (e) {
      toast({ title: 'Error', description: 'Could not update bank account', variant: 'destructive' });
    }
  };

  const removeAccount = async (id: string) => {
    try {
      await BankDetails.delete(id);
      const remaining = accounts.filter(a => a.id !== id);
      // Auto-promote first to primary if we deleted the primary
      if (accounts.find(a => a.id === id)?.is_primary && remaining.length > 0) {
        const first = remaining[0];
        await setPrimary(first.id, remaining);
        return;
      }
      setAccounts(remaining);
      toast({ title: 'Bank Deleted' });
    } catch (e) {
      toast({ title: 'Error', description: 'Could not delete bank account', variant: 'destructive' });
    }
  };

  const setPrimary = async (id: string, current?: any[]) => {
    try {
      const list = current || accounts;
      const currentPrimary = list.find(a => a.is_primary);
      if (currentPrimary && currentPrimary.id !== id) {
        await BankDetails.update(currentPrimary.id, { is_primary: false });
      }
      const newPrimary = await BankDetails.update(id, { is_primary: true });
      setAccounts(prev => prev.map(a => ({ ...a, is_primary: a.id === newPrimary.id })));
      toast({ title: 'Primary Bank Updated' });
    } catch (e) {
      toast({ title: 'Error', description: 'Could not set primary bank', variant: 'destructive' });
    }
  };

  const maskAcc = (acc: string) => acc ? acc.replace(/.(?=.{4})/g, '•') : '';
  const statusBadge = (s: string) => s === 'completed' ? (
    <Badge className="bg-green-100 text-green-700">Completed</Badge>
  ) : s === 'declined' ? (
    <Badge className="bg-red-100 text-red-700">Declined</Badge>
  ) : (
    <Badge className="bg-slate-100 text-slate-700 capitalize">{s || '—'}</Badge>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Hello {dealer?.business_name || 'Dealer'}</h1>
            <p className="text-slate-600 dark:text-slate-300">Welcome to Aura. You can add all your banks here.</p>
          </div>
          <div />
        </div>

        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="dark:bg-black dark:border-slate-700"><CardContent className="p-3"><div className="text-xs text-slate-500">Total Transactions</div><div className="text-xl font-bold">{kpis.total}</div></CardContent></Card>
            <Card className="dark:bg-black dark:border-slate-700"><CardContent className="p-3"><div className="text-xs text-slate-500">Completed</div><div className="text-xl font-bold">{kpis.completed}</div></CardContent></Card>
            <Card className="dark:bg-black dark:border-slate-700"><CardContent className="p-3"><div className="text-xs text-slate-500">Declined</div><div className="text-xl font-bold">{kpis.declined}</div></CardContent></Card>
            <Card className="dark:bg-black dark:border-slate-700"><CardContent className="p-3"><div className="text-xs text-slate-500">Amount Spent</div><div className="text-xl font-bold text-red-500">- ₹{kpis.spent.toLocaleString('en-IN')}</div></CardContent></Card>
            <Card className="dark:bg-black dark:border-slate-700"><CardContent className="p-3"><div className="text-xs text-slate-500">Amount Received</div><div className="text-xl font-bold text-green-600">+ ₹{kpis.received.toLocaleString('en-IN')}</div></CardContent></Card>
            <Card className="dark:bg-black dark:border-slate-700"><CardContent className="p-3"><div className="text-xs text-slate-500">Net</div><div className={`text-xl font-bold ${kpis.net >= 0 ? 'text-green-600' : 'text-red-500'}`}>{kpis.net >= 0 ? '+ ' : '- '}₹{Math.abs(kpis.net).toLocaleString('en-IN')}</div></CardContent></Card>
          </div>
        )}

        <Card className="dark:bg-black dark:border-slate-700">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Add Bank Account</CardTitle>
            <Button className="gap-2" onClick={openAdd}><Plus className="w-4 h-4" /> Add Bank</Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-300">Add your bank accounts to receive and make payments seamlessly.</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-black dark:border-slate-700">
          <CardHeader>
            <CardTitle>Your Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-10 text-slate-600 dark:text-slate-300">No bank accounts yet. Add your first bank to get started.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-2">Bank</th>
                      <th>Account</th>
                      <th>IFSC</th>
                      <th>Branch</th>
                      <th>Type</th>
                      <th>Primary</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="py-2 font-medium">{acc.bank_name}</td>
                        <td>{maskAcc(acc.account_number)}</td>
                        <td>{acc.ifsc_code}</td>
                        <td>{acc.branch || '—'}</td>
                        <td className="capitalize">{acc.account_type || 'current'}</td>
                        <td>
                          {acc.is_primary ? (
                            <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Primary</Badge>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setPrimary(acc.id)} className="h-7">Set Primary</Button>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setForm({ bank_name: acc.bank_name, account_holder: acc.account_holder_name, account_number: acc.account_number, ifsc: acc.ifsc_code, branch: acc.branch, account_type: acc.account_type }); setShowEdit({ open: true, account: acc }); }} className="h-7"><Edit className="w-3 h-3" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => removeAccount(acc.id)} className="h-7"><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-black dark:border-slate-700">
          <CardHeader>
            <CardTitle>Your Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-600 dark:text-slate-300">No transactions yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-2">Date</th>
                      <th>Transaction ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {transactions.map(tx => (
                      <React.Fragment key={tx.id}>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                          <td className="py-2 text-slate-600 dark:text-slate-300">{new Date(tx.transaction_date || tx.created_at).toLocaleString()}</td>
                          <td className="font-mono text-xs">{tx.id}</td>
                          <td className={`font-semibold flex items-center gap-1 ${tx.status === 'completed' ? (tx.type === 'purchase' ? 'text-red-500' : 'text-green-600') : 'text-slate-400'}`}>
                            {tx.status === 'completed' ? (tx.type === 'purchase' ? '-' : '+') : ''}
                            <IndianRupee className="w-3 h-3" />{(tx.status === 'completed' ? (tx.amount_number || 0) : 0).toLocaleString('en-IN')}
                          </td>
                          <td>{statusBadge(tx.status)}</td>
                          <td className="text-right"><Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}>{expandedId === tx.id ? 'Hide details' : 'View details'}</Button></td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="p-0">
                            <AnimatePresence initial={false}>
                              {expandedId === tx.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                                      <Detail label="Transaction date/time" value={new Date(tx.transaction_date || tx.created_at).toLocaleString()} />
                                      <Detail label="Transaction ID" value={tx.id} mono />
                                      <Detail label="Vehicle" value={tx.vehicle_title || tx.vehicle_id} />
                                      <Detail label="Type" value={tx.type} />
                                      <Detail label="Seller ID" value={tx.seller_id || '—'} mono />
                                      <Detail label="Seller name" value={tx.seller_name || '—'} />
                                      <Detail label="Buyer ID" value={tx.buyer_id || '—'} mono />
                                      <Detail label="Buyer name" value={tx.buyer_name || '—'} />
                                      <Detail label="Payment mode" value={tx.payment_method || '—'} />
                                      <Detail label="Actual price" value={`₹${(tx.amount_number || 0).toLocaleString('en-IN')}`} />
                                      <Detail label="Selling/Buying price (final)" value={`₹${(tx.amount_number || 0).toLocaleString('en-IN')}`} />
                                      <Detail label="Counterparty address" value={tx.type === 'purchase' ? (tx.seller_address || '—') : (tx.buyer_address || '—')} />
                                    </div>
                                    <div className="mt-3 text-right">
                                      <Button variant="outline" size="sm" onClick={() => setExpandedId(null)}>Collapse</Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Modal */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="dark:bg-slate-900 dark:text-white">
            <DialogHeader><DialogTitle>Add Bank Account</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Bank Name</Label>
                <Input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} />
              </div>
              <div>
                <Label>Account Holder</Label>
                <Input value={form.account_holder} onChange={e => setForm({ ...form, account_holder: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Account Number</Label>
                <Input value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} />
              </div>
              <div>
                <Label>IFSC</Label>
                <Input value={form.ifsc} onChange={e => setForm({ ...form, ifsc: e.target.value })} />
              </div>
              <div>
                <Label>Branch</Label>
                <Input value={form.branch || ''} onChange={e => setForm({ ...form, branch: e.target.value })} />
              </div>
              <div>
                <Label>Account Type</Label>
                <Input value={form.account_type || ''} onChange={e => setForm({ ...form, account_type: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={submitAdd}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEdit.open} onOpenChange={(v) => setShowEdit({ open: v, account: showEdit.account })}>
          <DialogContent className="dark:bg-slate-900 dark:text-white">
            <DialogHeader><DialogTitle>Edit Bank Account</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Bank Name</Label>
                <Input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} />
              </div>
              <div>
                <Label>Account Holder</Label>
                <Input value={form.account_holder} onChange={e => setForm({ ...form, account_holder: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Account Number</Label>
                <Input value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} />
              </div>
              <div>
                <Label>IFSC</Label>
                <Input value={form.ifsc} onChange={e => setForm({ ...form, ifsc: e.target.value })} />
              </div>
              <div>
                <Label>Branch</Label>
                <Input value={form.branch || ''} onChange={e => setForm({ ...form, branch: e.target.value })} />
              </div>
              <div>
                <Label>Account Type</Label>
                <Input value={form.account_type || ''} onChange={e => setForm({ ...form, account_type: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEdit({ open: false, account: null })}>Cancel</Button>
              <Button onClick={submitEdit}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 bg-white/40 dark:bg-slate-900/40 rounded p-2">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span className={mono ? 'font-mono text-xs' : 'font-medium'}>{String(value ?? '—')}</span>
    </div>
  );
}


