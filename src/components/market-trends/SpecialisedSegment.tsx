import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IndianRupee, Users } from 'lucide-react';

const SegmentCard = ({ title, data }) => (
    <div className="p-4 border rounded-lg bg-slate-50">
        <h4 className="font-bold text-lg text-slate-800">{title}</h4>
        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-slate-500"/>
                <div>
                    <p className="text-slate-500">GMV</p>
                    <p className="font-medium">₹{(data.gmv / 100000).toFixed(1)}L</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500"/>
                 <div>
                    <p className="text-slate-500">Dealers</p>
                    <p className="font-medium">{data.activeDealers}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <IndianRupee className="w-4 h-4 text-slate-500"/>
                 <div>
                    <p className="text-slate-500">Avg. Price</p>
                    <p className="font-medium">₹{(data.avgPrice / 100000).toFixed(1)}L</p>
                </div>
            </div>
             <div className="flex items-center gap-2">
                 <p className={`font-medium ${data.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>{data.trend > 0 ? `+${data.trend}`: data.trend}%</p>
                 <p className="text-slate-500">Trend</p>
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