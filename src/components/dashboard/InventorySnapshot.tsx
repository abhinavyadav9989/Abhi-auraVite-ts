
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Car, ArrowRight, AlertTriangle } from "lucide-react";

export default function InventorySnapshot({ data, dealer }) {
  const { live, aging, draft } = data;
  const total = live + draft;

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-blue-600 rounded-full opacity-10" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-blue-600 bg-opacity-10">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <Link to={createPageUrl("Inventory")}>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-sm font-medium text-slate-500 mb-1">
              Inventory Snapshot
            </CardTitle>
            <div className="text-3xl font-bold text-slate-900">{total}</div>
            <div className="text-sm text-slate-600">total vehicles</div>
          </div>
          
          <div className="space-y-2">
            <Link to={createPageUrl("Inventory") + `?status=live`} className="flex items-center justify-between group">
              <span className="text-sm text-slate-600 group-hover:text-blue-600">Live Listings</span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 group-hover:bg-blue-100 group-hover:text-blue-700">
                {live}
              </Badge>
            </Link>
            
            <Link to={createPageUrl("Inventory") + `?status=draft`} className="flex items-center justify-between group">
              <span className="text-sm text-slate-600 group-hover:text-blue-600">Draft</span>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700">
                {draft}
              </Badge>
            </Link>
            
            {aging > 0 && (
              <Link to={createPageUrl("Inventory") + `?filter=aging`} className="flex items-center justify-between group">
                <span className="text-sm text-slate-600 flex items-center gap-1 group-hover:text-blue-600">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  Aging ({">"}60d)
                </span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 group-hover:bg-blue-100 group-hover:text-blue-700">
                  {aging}
                </Badge>
              </Link>
            )}
          </div>
          
          <Link to={createPageUrl("Inventory")} className="block">
            <Button variant="ghost" size="sm" className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View All Inventory
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
