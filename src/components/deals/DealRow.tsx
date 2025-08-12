import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Eye, 
  IndianRupee, 
  Clock, 
  Star, 
  MapPin, 
  Truck, 
  FileText,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DealRow({ 
  transaction, 
  vehicle, 
  counterParty, 
  userRole, 
  isSelected, 
  onSelect, 
  statusColors 
}) {
  const formatPrice = (price) => price ? `₹${(price / 100000).toFixed(1)}L` : 'N/A';

  // Safe date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'MMM d');
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'offer_made':
      case 'negotiating':
        return Clock;
      case 'accepted':
      case 'completed':
        return CheckCircle;
      case 'disputed':
      case 'cancelled':
        return AlertTriangle;
      case 'paid':
      case 'picked_up':
      case 'in_transit':
      case 'delivered':
        return Truck;
      case 'rto_done':
        return FileText;
      default:
        return Clock;
    }
  };

  const StatusIcon = getStatusIcon(transaction.status);

  // Helper to determine who can take action
  const canTakeAction = () => {
    // Key fix: Only the counter party (not the last actor) can take action
    if (transaction.status === 'offer_made') {
      // Only seller can accept/reject initial buyer offer
      return userRole === 'seller' && transaction.last_action_by !== transaction.seller_id;
    }
    if (transaction.status === 'negotiating') {
      // Only the party who didn't make the last offer can respond
      return transaction.last_action_by !== (userRole === 'buyer' ? transaction.buyer_id : transaction.seller_id);
    }
    return false;
  };

  const getActionStatus = () => {
    if (transaction.status === 'offer_made' && userRole === 'buyer') {
      return "Waiting for seller's response";
    }
    if (transaction.status === 'negotiating') {
      if (canTakeAction()) {
        return "Your turn to respond";
      } else {
        return "Waiting for response";
      }
    }
    if (transaction.status === 'accepted' && userRole === 'buyer') {
      return "Payment required";
    }
    if (transaction.status === 'paid' && userRole === 'seller') {
      return "Arrange logistics";
    }
    if (transaction.status === 'picked_up' || transaction.status === 'in_transit') {
      return "Vehicle in transit";
    }
    if (transaction.status === 'delivered' && userRole === 'buyer') {
      return "Initiate RTO transfer";
    }
    if (transaction.status === 'rto_done') {
      return "Ready to complete";
    }
    return "No action required";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={onSelect}
            />

            {/* Vehicle Info */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                {vehicle?.images?.[0] ? (
                  <img 
                    src={vehicle.images[0]} 
                    alt="Vehicle" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-slate-300 rounded" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle Info Loading...'}
                </h3>
                <p className="text-sm text-slate-600">{vehicle?.registration_number}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="capitalize">{userRole}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Counter Party */}
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {counterParty?.business_name?.[0] || 'D'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{counterParty?.business_name || 'Loading...'}</div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{counterParty?.city}</span>
                  {counterParty?.rating && (
                    <>
                      <Star className="w-3 h-3 text-yellow-400 fill-current ml-1" />
                      <span>{counterParty.rating.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Price & Status */}
            <div className="text-right">
              <div className="flex items-center gap-1 font-bold text-lg">
                <IndianRupee className="w-4 h-4" />
                {formatPrice(transaction.current_offer)}
              </div>
              <Badge className={`${statusColors[transaction.status]} text-xs`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {transaction.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Action Status */}
            <div className="text-right min-w-[120px]">
              <div className="text-sm font-medium text-slate-700">
                {getActionStatus()}
              </div>
              {canTakeAction() && (
                <div className="text-xs text-blue-600 font-medium mt-1">
                  Action Required
                </div>
              )}
            </div>

            {/* View Button */}
            <Link to={createPageUrl(`DealRoom?id=${transaction.id}`)}>
              <Button size="sm" variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                View Deal
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}