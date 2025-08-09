
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label'; // Added Label import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Clock, Ban, Archive } from 'lucide-react';
import { Vehicle } from '@/api/entities';
import { AuditLog } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';

// Define valid state transitions for vehicles
const VEHICLE_STATE_MACHINE = {
  draft: ['live', 'archived'],
  live: ['in_deal', 'sold', 'archived', 'under_service', 'removed'],
  in_deal: ['live', 'sold', 'archived'],
  sold: ['archived'],
  archived: ['draft', 'live'],
  removed: ['draft', 'archived'],
  under_service: ['live', 'archived'],
  pending_review: ['live', 'removed', 'archived']
};

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  live: 'bg-green-100 text-green-800',
  in_deal: 'bg-blue-100 text-blue-800',
  sold: 'bg-purple-100 text-purple-800',
  archived: 'bg-slate-100 text-slate-800',
  removed: 'bg-red-100 text-red-800',
  under_service: 'bg-orange-100 text-orange-800',
  pending_review: 'bg-yellow-100 text-yellow-800'
};

const STATUS_ICONS = {
  draft: Clock,
  live: CheckCircle,
  in_deal: AlertTriangle,
  sold: CheckCircle,
  archived: Archive,
  removed: Ban,
  under_service: AlertTriangle,
  pending_review: Clock
};

export default function VehicleStateManager({ vehicle, user, onStateChange }) {
  const [isChanging, setIsChanging] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState('');
  const { toast } = useToast();
  
  const currentStatus = vehicle?.status || 'draft';
  const allowedTransitions = VEHICLE_STATE_MACHINE[currentStatus] || [];
  
  const handleStatusChange = async () => {
    if (!selectedNewStatus || !vehicle?.id) return;
    
    setIsChanging(true);
    try {
      // Update vehicle status
      await Vehicle.update(vehicle.id, { 
        status: selectedNewStatus,
        status_updated_at: new Date().toISOString()
      });
      
      // Log the status change
      await AuditLog.create({
        target_id: vehicle.id,
        target_type: 'Vehicle',
        actor_email: user?.email || 'system',
        action: 'status_change',
        details: `Vehicle status changed from ${currentStatus} to ${selectedNewStatus}`,
        changes: {
          status: {
            from: currentStatus,
            to: selectedNewStatus
          }
        }
      });
      
      toast({
        title: "Status Updated",
        description: `Vehicle status changed to ${selectedNewStatus.replace('_', ' ')}`
      });
      
      if (onStateChange) {
        onStateChange(selectedNewStatus);
      }
      
      setSelectedNewStatus('');
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChanging(false);
    }
  };
  
  const getCurrentStatusIcon = () => {
    const Icon = STATUS_ICONS[currentStatus] || Clock;
    return <Icon className="w-4 h-4" />;
  };
  
  const getStatusDescription = (status) => {
    const descriptions = {
      draft: 'Vehicle is in draft mode and not visible to buyers',
      live: 'Vehicle is active and visible in marketplace',
      in_deal: 'Vehicle is currently in a deal negotiation',
      sold: 'Vehicle has been sold and is no longer available',
      archived: 'Vehicle is archived and not visible',
      removed: 'Vehicle has been removed from marketplace',
      under_service: 'Vehicle is undergoing service/repairs',
      pending_review: 'Vehicle is pending admin review'
    };
    return descriptions[status] || 'Unknown status';
  };
  
  if (!vehicle) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Vehicle data not available</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getCurrentStatusIcon()}
          Vehicle Status Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Current Status:</span>
          <Badge className={STATUS_COLORS[currentStatus]}>
            {currentStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <p className="text-sm text-slate-600">
          {getStatusDescription(currentStatus)}
        </p>
        
        {allowedTransitions.length > 0 && (
          <div className="space-y-3">
            <Label htmlFor="status-select" className="text-sm font-medium">
              Change Status To:
            </Label>
            <div className="flex gap-2">
              <Select 
                value={selectedNewStatus} 
                onValueChange={setSelectedNewStatus}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select new status..." />
                </SelectTrigger>
                <SelectContent>
                  {allowedTransitions.map(status => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        {React.createElement(STATUS_ICONS[status] || Clock, { className: "w-4 h-4" })}
                        {status.replace('_', ' ').toUpperCase()}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleStatusChange}
                disabled={!selectedNewStatus || isChanging}
                className="min-w-[100px]"
              >
                {isChanging ? 'Updating...' : 'Update'}
              </Button>
            </div>
            
            {selectedNewStatus && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {getStatusDescription(selectedNewStatus)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {allowedTransitions.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No status changes are available for vehicles in &quot;{currentStatus}&quot; state.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
