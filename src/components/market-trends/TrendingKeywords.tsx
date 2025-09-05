import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';

export default function TrendingKeywords({ data = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5"/>
            Trending Searches
        </CardTitle>
        <CardDescription>Top search keywords from buyers this week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.map((item, index) => (
            <li key={index} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="font-medium text-slate-800 dark:text-white">{item.keyword}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.count.toLocaleString()} searches</span>
                <Badge variant={item.change >= 0 ? 'default' : 'destructive'} className="gap-1">
                  {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.change}%
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}