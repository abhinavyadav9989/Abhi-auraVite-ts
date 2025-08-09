import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Car, Gauge, Wrench, Shield, Check } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export default function FinalReviewStep({ data }) {
  return (
    <div className="space-y-6">
        <h2 className="text-xl font-bold text-center">Ready to Go!</h2>
        <p className="text-center text-slate-600">Please review all the details below before publishing your listing.</p>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{data.year} {data.make} {data.model}</CardTitle>
                    <p className="text-slate-500">{data.variant}</p>
                </div>
                <Badge variant="secondary" className="text-lg">{formatCurrency(data.asking_price)}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Car className="w-4 h-4 text-slate-500"/><span>{data.fuel_type}</span></div>
                    <div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-slate-500"/><span>{data.kilometers} kms</span></div>
                    <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-slate-500"/><span>{data.transmission}</span></div>
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-slate-500"/><span>{data.ownership} Owner</span></div>
                 </div>
                 <div className="border-t pt-4">
                     <h4 className="font-semibold mb-2">Description</h4>
                     <p className="text-sm text-slate-600">{data.description || 'No description provided.'}</p>
                 </div>
                 {data.images.length > 0 && (
                     <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Photos</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.images.slice(0, 5).map((img, i) => <img key={i} src={img} className="w-20 h-20 object-cover rounded-md border" />)}
                            {data.images.length > 5 && <div className="w-20 h-20 rounded-md border bg-slate-100 flex items-center justify-center">+{data.images.length - 5} more</div>}
                        </div>
                     </div>
                 )}
                 <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Publish Settings</h4>
                    <div className="flex items-center gap-6 text-sm">
                        <div>
                            <p className="text-slate-500">Inventory Type</p>
                            <p className="font-medium capitalize">{data.inventory_type}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Publish Schedule</p>
                            <p className="font-medium">{data.publish_at ? new Date(data.publish_at).toLocaleString() : 'Publish Immediately'}</p>
                        </div>
                    </div>
                 </div>
            </CardContent>
        </Card>
    </div>
  );
}