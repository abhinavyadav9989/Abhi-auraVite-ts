
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IndianRupee, ArrowRight, Shield } from "lucide-react";
import { Transaction } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";

export default function EscrowStatus({ data, dealer }) {
  const { amount, pending } = data;
  const progressValue = 65; // Mock progress percentage
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrillDown = async () => {
    try {
      const recentEscrowDeals = await Transaction.filter({
        $or: [
          { seller_id: dealer.id, status: 'paid' },
          { buyer_id: dealer.id, status: 'payment_pending' }
        ]
      }, '-created_date', 1);

      if (recentEscrowDeals.length > 0) {
        navigate(createPageUrl('DealRoom') + `?id=${recentEscrowDeals[0].id}`);
      } else {
        toast({
          title: "No Active Escrow Deals",
          description: "There are no deals currently in the escrow phase.",
        });
      }
    } catch (error) {
      console.error("Error fetching escrow deal:", error);
      toast({
        title: "Error",
        description: "Could not fetch escrow deal details.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-black dark:border-slate-800/80">
      <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-emerald-600 rounded-full opacity-10" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-emerald-600 bg-opacity-10 dark:bg-teal-600/15">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-teal-300" />
          </div>
          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-200 mb-1">
              Escrow Status
            </CardTitle>
            <div className="flex items-center gap-1 text-2xl font-bold text-slate-900 dark:text-white">
              <IndianRupee className="w-5 h-5" />
              {(amount / 100000).toFixed(1)}L
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">in secure escrow</div>
          </div>
          
          {/* Mini Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Funds Progress</span>
              <span>{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Delivery confirmed → Funds releasing
            </div>
          </div>
          
          {pending > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-200">Pending Releases</span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-teal-700/40 dark:text-teal-100">
                {pending}
              </Badge>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-teal-300 dark:hover:text-teal-200"
            onClick={handleDrillDown}
          >
            View Escrow Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
