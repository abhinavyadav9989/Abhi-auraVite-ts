
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  User
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { AuditLog } from '@/api/entities';
import { Loader2 } from 'lucide-react';

const getActionIcon = (action) => {
  const icons = {
    create: Activity,
    update: Activity,
    status_change: Activity,
    price_change: Activity,
    view: Activity,
    share: Activity
  };
  return icons[action] || Activity;
};

const getActionColor = (action) => {
    const colors = {
      create: 'text-green-600',
      update: 'text-blue-600',
      status_change: 'text-purple-600',
      price_change: 'text-orange-600',
      view: 'text-slate-600',
      share: 'text-teal-600'
    };
    return colors[action] || 'text-slate-600';
  };

  const getActionBg = (action) => {
    const colors = {
      create: 'bg-green-50',
      update: 'bg-blue-50',
      status_change: 'bg-purple-50',
      price_change: 'bg-orange-50',
      view: 'bg-slate-50',
      share: 'bg-teal-50'
    };
    return colors[action] || 'bg-slate-50';
  };

export default function HistoryTab({ vehicleId }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistoryData();
  }, [vehicleId]);

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      const logs = await AuditLog.filter({ target_id: vehicleId });
      setActivities((logs as any[]).sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()));
    } catch (error) {
      console.error("Failed to load history: -", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Vehicle History & Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActionIcon(activity.action);
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getActionBg(activity.action)}`}>
                      <Icon className={`w-4 h-4 ${getActionColor(activity.action)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 capitalize">{activity.action.replace('_', ' ')}</span>
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <User className="w-3 h-3"/>
                          {activity.actor_email.split('@')[0]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{activity.details}</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="text-xs text-slate-400">
                      {format(new Date(activity.created_date), 'MMM d, HH:mm')}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">No history recorded for this vehicle yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
