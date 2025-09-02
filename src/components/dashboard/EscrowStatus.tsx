
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
  const progressValue = amount > 0 ? 100 : 0; // Real progress based on actual data
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrillDown = async () => {
    try {
      const sellerDeals = await Transaction.filter({ seller_id: dealer.id, status: 'paid' });
      const buyerDeals = await Transaction.filter({ buyer_id: dealer.id, status: 'payment_pending' });
      const recentEscrowDeals = [...sellerDeals, ...buyerDeals];

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
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-emerald-600 rounded-full opacity-10" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-emerald-600 bg-opacity-10">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-sm font-medium text-slate-500 mb-1">
              Escrow Status
            </CardTitle>
            <div className="flex items-center gap-1 text-2xl font-bold text-slate-900">
              <IndianRupee className="w-5 h-5" />
              {(amount / 100000).toFixed(1)}L
            </div>
            <div className="text-sm text-slate-600">in secure escrow</div>
          </div>
          
          {/* Mini Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Funds Progress</span>
              <span>{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="text-xs text-slate-500">
              Delivery confirmed → Funds releasing
            </div>
          </div>
          
          {pending > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Pending Releases</span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {pending}
              </Badge>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={handleDrillDown}
          >
            View Escrow Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
