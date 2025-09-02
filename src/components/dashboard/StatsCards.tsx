import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function StatsCards({ title, value, icon: Icon, bgColor, trend }) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-slate-50 dark:bg-slate-900 hover:shadow-md transition-shadow duration-200">
      <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 ${bgColor} rounded-full opacity-10`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${bgColor} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${bgColor.replace('bg-', 'text-')}`} />
          </div>
          {trend && (
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
          {!trend && <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>}
          {trend && (
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}