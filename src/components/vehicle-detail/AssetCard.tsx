import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function AssetCard({ asset, onSetHero, onDelete, isHero }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'bg-slate-100 text-slate-700' },
    processing: { icon: Clock, color: 'bg-blue-100 text-blue-700' },
    ready: { icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    failed: { icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  };
  const StatusIcon = statusConfig[asset.status]?.icon || Clock;

  return (
    <Card className="group relative">
      <CardContent className="p-0">
        <div className="aspect-video bg-slate-100 rounded-t-lg overflow-hidden">
          <img src={asset.original_url} alt={asset.file_name} className="w-full h-full object-cover"/>
        </div>
        <div className="p-3">
          <p className="text-xs font-medium truncate">{asset.file_name}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge className={`${statusConfig[asset.status]?.color} capitalize`}>
              <StatusIcon className="w-3 h-3 mr-1"/>
              {asset.status}
            </Badge>
            {isHero && <Badge variant="default" className="bg-yellow-400 text-black">Hero</Badge>}
          </div>
        </div>
      </CardContent>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        {!isHero && asset.asset_type === 'image' && (
          <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/80" onClick={() => onSetHero(asset.id)}>
            <Star className="w-4 h-4" />
          </Button>
        )}
        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => onDelete(asset.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}