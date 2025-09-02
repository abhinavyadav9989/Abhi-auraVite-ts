import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Loader2 } from 'lucide-react';
import { Transaction } from '@/api/entities';
import { format, startOfToday } from 'date-fns';

const formatCurrency = (amount) => `₹${(amount / 100000).toFixed(2)}L`;

export default function AdminFeeKpiTile() {
  const [feeToday, setFeeToday] = useState(0);
  const [avgMargin, setAvgMargin] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todayStartISO = startOfToday().toISOString();

        // This is a simplification. A real app would use a more efficient backend query.
        const allTransactions = await Transaction.filter({ status: 'completed' });

        const completedToday = allTransactions.filter(t => t.updated_at >= todayStartISO);

        const totalFee = completedToday.reduce((sum, t) => sum + ((t.amount * 0.05) || 0), 0); // 5% platform fee
        setFeeToday(totalFee);

        const margins = completedToday.map(t => ((t.final_price || t.amount) - (t.initial_offer || t.amount)) || 0).filter(m => m > 0);
        const average = margins.length ? margins.reduce((sum, m) => sum + m, 0) / margins.length : 0;
        setAvgMargin(average);

      } catch (error) {
        console.error("Failed to fetch fee KPIs:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Revenue &amp; Margins</CardTitle>
        <IndianRupee className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-xs text-slate-500">Platform Fee Today</p>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(feeToday)}</div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Avg. Buyer Margin Today</p>
              <div className="text-2xl font-bold text-blue-600">{avgMargin > 0 ? `${avgMargin.toFixed(1)}%` : 'N/A'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}