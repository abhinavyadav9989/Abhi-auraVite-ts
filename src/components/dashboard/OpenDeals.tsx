
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Handshake, ArrowRight, Clock, CreditCard, AlertTriangle } from "lucide-react";

export default function OpenDeals({ data, dealer }) {
  const { negotiating, pending_payment, disputed } = data;
  const total = negotiating + pending_payment + disputed;

  return (
    <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-black dark:border-slate-800/80">
      <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-orange-600 rounded-full opacity-10 dark:opacity-20" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-orange-600 bg-opacity-10 dark:bg-amber-500/15">
            <Handshake className="w-6 h-6 text-orange-600 dark:text-amber-300" />
          </div>
          <Link to={createPageUrl("Deals")}>
            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 dark:text-amber-300 dark:hover:text-amber-200">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-white mb-1">
              Open Deals
            </CardTitle>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{total}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">active negotiations</div>
          </div>
          
          <div className="space-y-2">
            {negotiating > 0 && (
              <Link to={createPageUrl("Deals") + `?tab=active`} className="flex items-center justify-between group">
                <span className="text-sm text-slate-600 dark:text-slate-200 flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-teal-300">
                  <Clock className="w-3 h-3 text-blue-500 dark:text-teal-300" />
                  Negotiating
                </span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-teal-700/40 dark:text-teal-100">
                  {negotiating}
                </Badge>
              </Link>
            )}
            
            {pending_payment > 0 && (
              <Link to={createPageUrl("Deals") + `?tab=payment`} className="flex items-center justify-between group">
                <span className="text-sm text-slate-600 dark:text-slate-200 flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-teal-300">
                  <CreditCard className="w-3 h-3 text-amber-500 dark:text-amber-300" />
                  Pending Payment
                </span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-amber-700/40 dark:text-amber-100">
                  {pending_payment}
                </Badge>
              </Link>
            )}
            
            {disputed > 0 && (
              <Link to={createPageUrl("Deals") + `?tab=issues`} className="flex items-center justify-between group">
                <span className="text-sm text-slate-600 dark:text-slate-200 flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-teal-300">
                  <AlertTriangle className="w-3 h-3 text-red-500 dark:text-red-300" />
                  Disputed
                </span>
                <Badge variant="secondary" className="bg-red-100 text-red-700 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-red-700/40 dark:text-red-100">
                  {disputed}
                </Badge>
              </Link>
            )}
          </div>
          
          {total === 0 ? (
            <div className="text-center py-4">
              <div className="text-sm text-slate-500">No active deals</div>
              <Link to={createPageUrl("Marketplace")}>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 mt-2">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          ) : (
            <Link to={createPageUrl("Deals")} className="block">
              <Button variant="ghost" size="sm" className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                View All Deals
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
