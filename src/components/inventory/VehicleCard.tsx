import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Car, IndianRupee, Share2, MoreVertical, Calendar, Gauge, Trash2 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PasswordConfirmationModal from "@/components/ui/password-confirmation-modal";

type VehicleCardProps = {
  vehicle: any;
  isSelected: boolean;
  onSelect: (vehicleId: string, selected: boolean) => void;
  onShare: (vehicle: any) => void;
  onDelete?: (vehicleId: string) => void;
}

export default function VehicleCard({ vehicle, isSelected, onSelect, onShare, onDelete }: VehicleCardProps) {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null);

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  const heroImage = vehicle.hero_image_url || (vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null);

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-100 text-slate-700",
      live: "bg-green-100 text-green-700",
      in_deal: "bg-blue-100 text-blue-700",
      sold: "bg-purple-100 text-purple-700",
      archived: "bg-slate-100 text-slate-500"
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const handleEditClick = () => {
    setPendingAction('edit');
    setShowPasswordModal(true);
  };

  const handleDeleteClick = () => {
    setPendingAction('delete');
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = () => {
    if (pendingAction === 'edit') {
      navigate(createPageUrl(`AddVehicle?id=${vehicle.id}&mode=edit`));
    } else if (pendingAction === 'delete' && onDelete) {
      onDelete(vehicle.id);
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPendingAction(null);
  };

    return (
    <>
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative group">
        <CardHeader className="absolute top-2 left-2 z-10 p-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(vehicle.id, checked === true)}
            className="w-5 h-5 bg-slate-50 dark:bg-slate-900"
          />
        </CardHeader>
        <Badge className={`absolute top-2 right-2 z-10 ${getStatusColor(vehicle.status)}`}>
          {vehicle.status.replace('_', ' ').toUpperCase()}
        </Badge>

        <Link to={createPageUrl(`VehicleDetail?id=${vehicle.id}`)} className="block">
          <CardContent className="p-0">
            <div className="aspect-video bg-slate-200 overflow-hidden">
              {heroImage ? (
                <img src={heroImage} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Car className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold truncate">{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h3>
              <p className="text-sm text-slate-600 truncate">{vehicle.variant}</p>
              <div className="flex justify-between items-center pt-2">
                <div className="text-lg font-bold text-slate-800 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {formatPrice(vehicle.asking_price)}
                </div>
                <div className="flex gap-3 text-sm text-slate-500">
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{vehicle.year}</div>
                  <div className="flex items-center gap-1"><Gauge className="w-4 h-4" />{(vehicle.kilometers / 1000).toFixed(0)}k km</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>

        <CardFooter className="p-4 bg-slate-50/50">
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-slate-500">Reg: {vehicle.registration_number}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onShare(vehicle)}>
                  <Share2 className="w-4 h-4 mr-2" /> Share Listing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditClick}>
                  <MoreVertical className="w-4 h-4 mr-2" /> Edit Listing
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem onClick={handleDeleteClick}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Listing
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>

      <PasswordConfirmationModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onConfirm={handlePasswordConfirm}
        title={pendingAction === 'edit' ? 'Edit Vehicle Listing' : 'Delete Vehicle Listing'}
        description={
          pendingAction === 'edit' 
            ? 'Please enter your password to edit this vehicle listing.'
            : 'This action cannot be undone. Please enter your password to permanently delete this vehicle listing.'
        }
        confirmText={pendingAction === 'edit' ? 'Edit Listing' : 'Delete Listing'}
        actionType={pendingAction || 'edit'}
      />
    </>
  );
 }