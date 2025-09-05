import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IndianRupee, Users } from 'lucide-react';

const SegmentCard = ({ title, data }) => (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{title}</h4>
        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-slate-500 dark:text-slate-400"/>
                <div>
                    <p className="text-slate-500 dark:text-slate-400">GMV</p>
                    <p className="font-medium text-slate-900 dark:text-white">₹{(data.gmv / 100000).toFixed(1)}L</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500 dark:text-slate-400"/>
                 <div>
                    <p className="text-slate-500 dark:text-slate-400">Dealers</p>
                    <p className="font-medium text-slate-900 dark:text-white">{data.activeDealers}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <IndianRupee className="w-4 h-4 text-slate-500 dark:text-slate-400"/>
                 <div>
                    <p className="text-slate-500 dark:text-slate-400">Avg. Price</p>
                    <p className="font-medium text-slate-900 dark:text-white">₹{(data.avgPrice / 100000).toFixed(1)}L</p>
                </div>
            </div>
             <div className="flex items-center gap-2">
                 <p className={`font-medium ${data.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>{data.trend > 0 ? `+${data.trend}`: data.trend}%</p>
                 <p className="text-slate-500 dark:text-slate-400">Trend</p>
            </div>
        </div>
    </div>
);

export default function SpecialisedSegment({ data = {} }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Specialised Segments</CardTitle>
        <CardDescription>Performance of high-value and commercial vehicle markets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
            <SegmentCard key={key} title={key.charAt(0).toUpperCase() + key.slice(1)} data={value} />
        ))}
      </CardContent>
    </Card>
  );
}