import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function BusinessHours({ 
  businessHours = [], 
  onHoursUpdate, 
  canEdit, 
  isCurrentlyOpen = false 
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Business Hours
          </CardTitle>
          <Badge variant={isCurrentlyOpen ? "default" : "secondary"} className="gap-1">
            <div className={`w-2 h-2 rounded-full ${isCurrentlyOpen ? 'bg-green-500' : 'bg-slate-400'}`} />
            {isCurrentlyOpen ? 'Open Now' : 'Closed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day, index) => {
            const dayHours = businessHours.find(h => h.day_of_week === index);
            const isOpen = dayHours?.is_open ?? (index >= 1 && index <= 6);
            const openTime = dayHours?.open_time || '10:00';
            const closeTime = dayHours?.close_time || '19:00';

            return (
              <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <span className="font-medium">{day}</span>
                  </div>
                  {canEdit && (
                    <Switch
                      checked={isOpen}
                      onCheckedChange={(checked) => onHoursUpdate && onHoursUpdate(index, 'is_open', checked)}
                    />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <>
                      {canEdit ? (
                        <>
                          <Input
                            type="time"
                            value={openTime}
                            onChange={(e) => onHoursUpdate && onHoursUpdate(index, 'open_time', e.target.value)}
                            className="w-24"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={closeTime}
                            onChange={(e) => onHoursUpdate && onHoursUpdate(index, 'close_time', e.target.value)}
                            className="w-24"
                          />
                        </>
                      ) : (
                        <span className="text-slate-600">{openTime} - {closeTime}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-500">Closed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {!canEdit && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              Business hours are displayed on your public profile to help customers know when you&apos;re available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}