import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Car, IndianRupee, Share2, MoreVertical, Calendar, Gauge, Trash2, Eye, Edit } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PasswordConfirmationModal from "@/components/ui/password-confirmation-modal";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

type VehicleCard3DProps = {
  vehicle: any;
  isSelected: boolean;
  onSelect: (vehicleId: string, selected: boolean) => void;
  onShare: (vehicle: any) => void;
  onDelete?: (vehicleId: string) => void;
};

export default function VehicleCard3D({ vehicle, isSelected, onSelect, onShare, onDelete }: VehicleCard3DProps) {
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
      <CardContainer className="w-full h-full">
        <CardBody className="bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl border hover:shadow-xl transition-all duration-300">
          {/* Selection Checkbox */}
          <CardItem translateZ="20" className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(vehicle.id, checked === true)}
              className="w-5 h-5 bg-white"
            />
          </CardItem>

          {/* Status Badge */}
          <CardItem translateZ="30" className="absolute top-2 right-2 z-10">
            <Badge className={`${getStatusColor(vehicle.status)}`}>
              {vehicle.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardItem>

          {/* Vehicle Image */}
          <Link to={createPageUrl(`VehicleDetail?id=${vehicle.id}`)} className="block">
            <CardItem translateZ="50" className="w-full">
              <div className="aspect-video bg-slate-200 overflow-hidden rounded-t-xl">
                {heroImage ? (
                  <img 
                    src={heroImage} 
                    alt={`${vehicle.make} ${vehicle.model}`} 
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Car className="w-10 h-10" />
                  </div>
                )}
              </div>
            </CardItem>
          </Link>

          {/* Vehicle Details */}
          <div className="p-4 space-y-3">
            <CardItem translateZ="40" className="space-y-1">
              <h3 className="font-semibold text-lg text-slate-900 group-hover/card:text-blue-600 transition-colors">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-slate-600">{vehicle.variant}</p>
            </CardItem>

            <CardItem translateZ="45" className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{vehicle.year}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Gauge className="w-4 h-4" />
                <span>{vehicle.kilometers?.toLocaleString()} km</span>
              </div>
            </CardItem>

            <CardItem translateZ="50" className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{vehicle.fuel_type}</span> • <span>{vehicle.transmission}</span>
              </div>
              <div className="text-lg font-bold text-slate-900 flex items-center gap-1">
                <IndianRupee className="w-4 h-4" />
                {formatPrice(vehicle.asking_price)}
              </div>
            </CardItem>

            {/* Action Buttons */}
            <CardItem translateZ="60" className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(createPageUrl(`VehicleDetail?id=${vehicle.id}`))}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditClick}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onShare(vehicle)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>

      <PasswordConfirmationModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onConfirm={handlePasswordConfirm}
        title={pendingAction === 'edit' ? 'Edit Vehicle' : 'Delete Vehicle'}
        description={pendingAction === 'edit' 
          ? 'Please enter your password to edit this vehicle.' 
          : 'Please enter your password to delete this vehicle. This action cannot be undone.'
        }
      />
    </>
  );
}
