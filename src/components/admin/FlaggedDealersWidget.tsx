import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Calendar, Archive, UserX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

export default function FlaggedDealersWidget({ flaggedDealers = [], onUnflag, onSuspend, onForceUnlist, onFlag }: any) {
  const { toast } = useToast();

  const handleUnflag = async (dealerId) => {
    try {
      await onUnflag?.(dealerId);
      toast({
        title: "Dealer Unflagged",
        description: "The dealer has been removed from the flagged list.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unflag dealer.",
        variant: "destructive"
      });
    }
  };

  const handleSuspend = async (dealerId) => {
    try {
      await onSuspend?.(dealerId);
      toast({
        title: "Dealer Suspended",
        description: "The dealer account has been suspended.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend dealer.",
        variant: "destructive"
      });
    }
  };

  const handleForceUnlist = async (dealerId) => {
    try {
      await onForceUnlist?.(dealerId);
      toast({
        title: "Vehicles Unlisted",
        description: "All vehicles for this dealer have been archived.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unlist vehicles.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Flagged Dealers
          <Badge variant="destructive">{flaggedDealers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {flaggedDealers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No flagged dealers</p>
            <p className="text-sm">All dealers are in good standing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flaggedDealers.map((dealer) => (
              <div 
                key={dealer.id}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{dealer.name}</h4>
                    <Badge variant="destructive" className="text-xs">
                      {dealer.flags} flags
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{dealer.reason}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    Flagged {formatDistanceToNow(new Date(dealer.flaggedAt), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnflag(dealer.id)}
                  >
                    Unflag
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleForceUnlist(dealer.id)}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Unlist All
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleSuspend(dealer.id)}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Suspend
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}