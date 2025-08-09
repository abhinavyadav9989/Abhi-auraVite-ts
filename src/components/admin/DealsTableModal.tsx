import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  X,
  IndianRupee,
  CheckCircle,
  Clock,
  Car
} from 'lucide-react';
import { format } from 'date-fns';

export default function DealsTableModal({ deals, title, onClose }) {
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `₹${(price / 100000).toFixed(1)}L`;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700",
      active: "bg-blue-100 text-blue-700",
      negotiating: "bg-orange-100 text-orange-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          <div className="relative">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">Vehicle</th>
                  <th scope="col" className="px-6 py-3">Final Price</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Completed Date</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-slate-400" />
                        <span>{deal.vehicle_name || '2021 Hyundai Creta'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        {formatPrice(deal.final_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(deal.status)} capitalize`}>
                        {deal.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(deal.completed_at || Date.now()), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={createPageUrl(`DealRoom?id=${deal.id}`)}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}