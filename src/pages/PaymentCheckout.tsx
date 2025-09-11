import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dealer, Transaction, Vehicle } from '@/api/entities';
import { ArrowLeft, CreditCard, IndianRupee, Download, QrCode } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function PaymentCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paymentMode, setPaymentMode] = useState<'card' | 'upi'>('card');
  const [paymentMeta, setPaymentMeta] = useState<{ id: string; mode: string; timestamp: string } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    (async () => {
      try {
        const transactionId = params.get('id');
        if (!transactionId) {
          setError('No transaction ID provided.');
          setIsLoading(false);
          return;
        }

        const tx = await Transaction.get(transactionId);
        if (!tx) {
          setError('Transaction not found.');
          setIsLoading(false);
          return;
        }
        setTransaction(tx);
        const [veh, buyerDealer, sellerDealer] = await Promise.all([
          Vehicle.get(tx.vehicle_id),
          Dealer.get(tx.buyer_id),
          Dealer.get(tx.seller_id),
        ]);
        setVehicle(veh);
        setBuyer(buyerDealer);
        setSeller(sellerDealer);
      } catch (e) {
        console.error(e);
        setError('Failed to load payment details.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params]);

  const formatLakh = (amount?: number) => (amount ? `₹${(amount / 100000).toFixed(2)}L` : '₹0.00L');

  const handlePay = async () => {
    if (!transaction || !vehicle) return;

    const txnId = `TXN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    setPaymentMeta({ id: txnId, mode: paymentMode === 'card' ? 'Credit Card' : 'UPI', timestamp });

    // Mark paid and completed, set amount_paid and add timeline event
    try {
      const updatedTimeline = [
        ...(transaction.timeline || []),
        {
          timestamp,
          status: 'paid',
          user_id: transaction.buyer_id,
          details: `Payment completed via ${paymentMode === 'card' ? 'Credit Card' : 'UPI'} (${txnId}).`,
        },
        {
          timestamp,
          status: 'completed',
          user_id: transaction.seller_id,
          details: 'Deal closed after successful payment.',
        },
      ];

      await Transaction.update(transaction.id, {
        status: 'completed',
        amount_paid: transaction.final_price || transaction.current_offer,
        last_action_by: transaction.buyer_id,
        timeline: updatedTimeline,
        payment_method: paymentMode === 'card' ? 'card' : 'upi',
        transaction_date: timestamp,
        metadata: {
          ...(transaction.metadata || {}),
          payment: {
            txn_id: txnId,
            mode: paymentMode === 'card' ? 'card' : 'upi',
            paid_at: timestamp,
            amount: transaction.final_price || transaction.current_offer,
            currency: transaction.currency || 'INR'
          }
        }
      });

      // Also mark vehicle as sold and store buyer info for inventory visibility
      try {
        await Vehicle.update(transaction.vehicle_id, {
          // Hide from marketplace by making it non-public
          inventory_type: 'private',
          custom_attributes: {
            ...(vehicle?.custom_attributes || {}),
            sold: {
              buyer_id: transaction.buyer_id,
              buyer_name: buyer?.business_name || null,
              transaction_id: transaction.id,
              paid_at: timestamp
            }
          }
        });
      } catch (e) {
        console.warn('Vehicle update to sold failed (non-blocking):', e);
      }

      setTransaction((prev: any) => ({
        ...prev,
        status: 'completed',
        amount_paid: prev.final_price || prev.current_offer,
        timeline: updatedTimeline,
        payment_method: paymentMode === 'card' ? 'card' : 'upi',
        transaction_date: timestamp,
        metadata: {
          ...(prev?.metadata || {}),
          payment: {
            txn_id: txnId,
            mode: paymentMode === 'card' ? 'card' : 'upi',
            paid_at: timestamp,
            amount: prev.final_price || prev.current_offer,
            currency: prev.currency || 'INR'
          }
        }
      }));
    } catch (e) {
      console.error('Payment simulation failed', e);
      setError('Payment failed. Please try again.');
    }
  };

  const downloadReceipt = async () => {
    if (!paymentMeta || !transaction || !vehicle || !buyer || !seller) return;
    setIsGeneratingPdf(true);

    const mount = document.createElement('div');
    mount.id = 'receipt-printable';
    mount.className = 'p-6 w-[900px] bg-white text-slate-900';
    mount.innerHTML = `
      <div style="font-family: ui-sans-serif, system-ui;">
        <h1 style="font-size:20px; font-weight:700; margin-bottom:8px;">Payment Receipt</h1>
        <div style="font-size:12px; color:#475569; margin-bottom:16px;">Generated by Aura</div>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:6px; font-weight:600; background:#f1f5f9;">Transaction ID</td><td style="padding:6px;">${paymentMeta.id}</td></tr>
          <tr><td style="padding:6px; font-weight:600; background:#f1f5f9;">Payment Time</td><td style="padding:6px;">${new Date(paymentMeta.timestamp).toLocaleString()}</td></tr>
          <tr><td style="padding:6px; font-weight:600; background:#f1f5f9;">Payment Mode</td><td style="padding:6px;">${paymentMeta.mode}</td></tr>
        </table>
        <h2 style="margin-top:16px; font-weight:700;">Buyer</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:6px; background:#f8fafc; width:220px;">Name</td><td style="padding:6px;">${buyer.business_name || ''}</td></tr>
          <tr><td style="padding:6px; background:#f8fafc;">Phone</td><td style="padding:6px;">${buyer.phone || ''}</td></tr>
          <tr><td style="padding:6px; background:#f8fafc;">Location</td><td style="padding:6px;">${buyer.city || ''}, ${buyer.state || ''}</td></tr>
        </table>
        <h2 style="margin-top:16px; font-weight:700;">Seller</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:6px; background:#f8fafc; width:220px;">Name</td><td style="padding:6px;">${seller.business_name || ''}</td></tr>
          <tr><td style="padding:6px; background:#f8fafc;">Phone</td><td style="padding:6px;">${seller.phone || ''}</td></tr>
          <tr><td style="padding:6px; background:#f8fafc;">Location</td><td style="padding:6px;">${seller.city || ''}, ${seller.state || ''}</td></tr>
        </table>
        <h2 style="margin-top:16px; font-weight:700;">Vehicle</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:6px; background:#f1f5f9; width:220px;">Title</td><td style="padding:6px;">${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}</td></tr>
          <tr><td style="padding:6px; background:#f1f5f9;">Registration</td><td style="padding:6px;">${vehicle.registration_number || ''}</td></tr>
          <tr><td style="padding:6px; background:#f1f5f9;">Fuel / Transmission</td><td style="padding:6px;">${vehicle.fuel_type || ''} / ${vehicle.transmission || ''}</td></tr>
        </table>
        <h2 style="margin-top:16px; font-weight:700;">Price Breakdown</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:6px; background:#f8fafc; width:220px;">Final Price</td><td style="padding:6px;">${formatLakh(transaction.final_price || transaction.current_offer)}</td></tr>
          <tr><td style="padding:6px; background:#f8fafc;">Amount Paid</td><td style="padding:6px;">${formatLakh(transaction.final_price || transaction.current_offer)}</td></tr>
        </table>
      </div>
    `;

    document.body.appendChild(mount);
    try {
      const canvas = await html2canvas(mount, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const filename = `Payment_Receipt_${paymentMeta.id}.pdf`;
      pdf.save(filename);
    } finally {
      document.body.removeChild(mount);
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={() => navigate(createPageUrl('DealRoom') + `?id=${transaction.id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Deal
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="border-b dark:border-slate-800">
            <CardTitle className="text-lg">Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Buyer</h3>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{buyer?.business_name}</div>
                <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{buyer?.phone}</div>
                <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{buyer?.city}, {buyer?.state}</div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Seller</h3>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{seller?.business_name}</div>
                <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{seller?.phone}</div>
                <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{seller?.city}, {seller?.state}</div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Vehicle</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">Title</td>
                      <td className="py-2">{vehicle?.year} {vehicle?.make} {vehicle?.model} {vehicle?.variant}</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">Registration</td>
                      <td className="py-2">{vehicle?.registration_number}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">Fuel / Transmission</td>
                      <td className="py-2">{vehicle?.fuel_type} / {vehicle?.transmission}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Price</h3>
              <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Amount Due</span>
                <span className="font-bold flex items-center gap-1"><IndianRupee className="w-4 h-4" />{formatLakh(transaction.final_price || transaction.current_offer)}</span>
              </div>
            </section>

            <Separator className="dark:bg-slate-800" />

            <section>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Payment Method</h3>
              <RadioGroup value={paymentMode} onValueChange={(v: any) => setPaymentMode(v)} className="grid md:grid-cols-2 gap-3">
                <Label htmlFor="card" className="border border-slate-200 dark:border-slate-700 rounded p-3 flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800">
                  <RadioGroupItem id="card" value="card" />
                  <CreditCard className="w-4 h-4" /> Credit Card
                </Label>
                <Label htmlFor="upi" className="border border-slate-200 dark:border-slate-700 rounded p-3 flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800">
                  <RadioGroupItem id="upi" value="upi" />
                  <QrCode className="w-4 h-4" /> UPI
                </Label>
              </RadioGroup>
            </section>

            <div className="flex items-center justify-between pt-2">
              {!paymentMeta ? (
                <Button className="gap-2" onClick={handlePay}>
                  Pay Now
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600 dark:text-green-400">Payment successful</span>
                  <Button variant="outline" className="gap-2" onClick={downloadReceipt} disabled={isGeneratingPdf}>
                    <Download className="w-4 h-4" /> Download Receipt
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


