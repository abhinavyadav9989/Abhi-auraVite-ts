import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Handshake, IndianRupee, Clock, ArrowRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActiveDeals({ deals, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Active Deals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="p-3 border border-slate-100 rounded-lg space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const activeDeals = deals.filter(deal => deal.status === 'active');

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Active Deals</CardTitle>
        <Link to={createPageUrl("Deals")}>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeDeals.length === 0 ? (
          <div className="text-center py-6">
            <Handshake className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No active deals</p>
          </div>
        ) : (
          activeDeals.slice(0, 3).map((deal) => (
            <div key={deal.id} className="p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <IndianRupee className="w-3 h-3" />
                  {(deal.current_offer / 100000).toFixed(1)}L
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                {deal.expires_at && formatDistanceToNow(new Date(deal.expires_at), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}