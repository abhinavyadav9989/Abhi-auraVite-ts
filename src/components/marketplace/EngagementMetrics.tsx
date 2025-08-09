import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';

export default function EngagementMetrics({ vehicle = {}, userClientType = 'individual' }) {
  // Mock engagement data - in real app this would come from analytics
  const metrics = {
    views: Math.floor(Math.random() * 50) + 10,
    shortlists: Math.floor(Math.random() * 15) + 2,
    inquiries: Math.floor(Math.random() * 8) + 1,
    trending: Math.random() > 0.7
  };

  // Don't show for own vehicles or if minimal engagement
  if (userClientType === 'self_user' || (metrics.views < 5 && metrics.shortlists < 1)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {metrics.trending && (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          <TrendingUp className="w-3 h-3 mr-1" />
          Trending
        </Badge>
      )}
      
      <div className="flex items-center gap-3 text-slate-500">
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{metrics.views}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          <span>{metrics.shortlists}</span>
        </div>
        
        {metrics.inquiries > 0 && (
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{metrics.inquiries}</span>
          </div>
        )}
      </div>
    </div>
  );
}