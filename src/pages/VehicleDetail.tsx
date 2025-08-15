import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { Shortlist } from '@/api/entities';
import { VehicleInspection } from '@/api/entities';
import { AuditLog } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatKilometers, ensureArray, safeGet } from '@/components/formatters';
import {
  ArrowLeft, Edit, Share2, Handshake, Loader2, Ban, Star, ShieldCheck,
  IndianRupee, MapPin, Calendar, Fuel, Settings, Users, Palette, Gauge, Phone, MessageCircle,
  Calculator, FileText, History, Lightbulb, Camera, Video, Download, Heart,
  Clock, Eye, TrendingUp, AlertTriangle, CheckCircle, Copy, QrCode,
  X,
} from 'lucide-react';

// Import components
import VehicleMediaGallery from '@/components/vehicle-view/VehicleMediaGallery';
import EMICalculator from '@/components/vehicle-view/EMICalculator';
import FullScreenGallery from '@/components/vehicle-view/FullScreenGallery';
import MarketplaceMetrics from '@/components/vehicle-view/MarketplaceMetrics';
import ShareModal from '@/components/vehicle-view/ShareModal';
import OfferModal from '@/components/marketplace/OfferModal';
import InspectorPanel from '@/components/inventory/InspectorPanel';

const CATEGORY_FIELD_LABELS = {
    engine_displacement: 'Engine (cc)',
    bike_type: 'Bike Type',
    cargo_capacity: 'Cargo Capacity (kg)',
    usage_type: 'Usage Type',
    gvw: 'Gross Vehicle Weight (kg)',
    payload: 'Payload (kg)',
    axles: 'Number of Axles',
    permit_status: 'Permit Status',
    fitness_expiry: 'Fitness Expiry',
    special_feature: 'Special Feature',
    temp_range: 'Temperature Range',
    battery_health: 'Battery Health (%)',
    range_km: 'Range (km)',
    charger_type: 'Charger Type',
};

export default function VehicleDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Core state
  const [vehicle, setVehicle] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [user, setUser] = useState(null);
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isUnderReview, setIsUnderReview] = useState(false);
  
  // Inspections state
  const [inspections, setInspections] = useState([]);
  const [showInspectorPanel, setShowInspectorPanel] = useState(false);
  
  // Permissions & security
  const [permissions, setPermissions] = useState({ 
    canEdit: false, 
    isAdmin: false, 
    isOwner: false,
    canMakeOffer: false,
    canViewFinancials: false,
    canInspect: false
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showGallery, setShowGallery] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [isInShortlist, setIsInShortlist] = useState(false);
  
  // Analytics & engagement
  const [viewCount, setViewCount] = useState(0);
  const [marketData, setMarketData] = useState(null);
  const [relatedVehicles, setRelatedVehicles] = useState([]);
  const [dealHistory, setDealHistory] = useState([]);
  
  const vehicleId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (!vehicleId) {
      setError('No vehicle ID provided.');
      setIsLoading(false);
      return;
    }
    fetchVehicleData();
  }, [vehicleId]);

  const fetchVehicleData = async () => {
    try {
      setIsLoading(true);
      
      const [currentUser] = await Promise.all([User.me().catch(() => null)]);
      
      const vehicleData = await Vehicle.get(vehicleId);
      if (!vehicleData) {
        setError('Vehicle not found.');
        setIsLoading(false);
        return;
      }
      
      setUser(currentUser);
      setVehicle(vehicleData);
      
      const [dealerData, currentDealerDataArray] = await Promise.all([
        Dealer.get(vehicleData.dealer_id),
        currentUser ? Dealer.filter({ created_by: currentUser.email }) : Promise.resolve([])
      ]);
      
      const currentDealerData = currentDealerDataArray.length > 0 ? currentDealerDataArray[0] : null;

      setDealer(dealerData);
      if (currentDealerData) setCurrentDealer(currentDealerData);

      // Check if user is verified (either verification_status or verification_status_new)
      if (currentDealerData) {
        const isVerified = currentDealerData.verification_status === 'verified' || currentDealerData.verification_status_new === 'verified';
        const isUnderReview = currentDealerData.verification_status === 'documents_submitted' || currentDealerData.verification_status_new === 'documents_submitted';
        
        setIsUserVerified(isVerified);
        setIsUnderReview(isUnderReview);
        
        console.log('User verification status in VehicleDetail:', {
          verification_status: currentDealerData.verification_status,
          verification_status_new: currentDealerData.verification_status_new,
          isVerified: isVerified,
          isUnderReview: isUnderReview
        });
      }

      const isAdmin = currentUser?.role === 'admin';
      const isOwner = currentDealerData && vehicleData.dealer_id === currentDealerData.id;
      const isEditableStatus = ['draft', 'live'].includes(vehicleData.status);
      const canMakeOffer = currentUser && !isOwner && vehicleData.status === 'live';
      const canInspect = isAdmin || (isOwner && ['draft', 'service'].includes(vehicleData.status));

      setPermissions({
        canEdit: (isAdmin || isOwner) && isEditableStatus,
        isAdmin: isAdmin,
        isOwner: isOwner,
        canMakeOffer: canMakeOffer,
        canViewFinancials: isAdmin || isOwner,
        canInspect: canInspect
      });

      await Promise.all([
        loadMarketData(vehicleData),
        loadRelatedVehicles(vehicleData),
        loadDealHistory(vehicleData),
        loadInspections(vehicleData.id),
        currentUser ? checkShortlistStatus(vehicleData.id, currentDealerData) : Promise.resolve(),
        currentUser ? trackVehicleView(vehicleData.id, currentUser) : Promise.resolve(),
      ]);

    } catch (err) {
      console.error('Error fetching vehicle details:', err);
      setError('Failed to load vehicle details.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMarketData = async (vehicleData) => {
    setMarketData({
      averagePrice: vehicleData.asking_price * 0.95,
      priceRange: { min: vehicleData.asking_price * 0.85, max: vehicleData.asking_price * 1.15 },
      daysToSell: 45,
      viewsLast7Days: 23,
      interestLevel: 'High'
    });
  };

  const loadRelatedVehicles = async (vehicleData) => {
    try {
      const related = await Vehicle.filter({ make: vehicleData.make, status: 'live' });
      const pruned = (related || []).filter(v => v.id !== vehicleData.id);
      // Optional: sort newest first and limit 4
      const sorted = pruned.sort((a, b) => new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime());
      setRelatedVehicles(sorted.slice(0, 4));
    } catch (error) { console.error('Error loading related vehicles:', error); }
  };

  const loadDealHistory = async (vehicleData) => {
    try {
      const deals = await Transaction.filter({ vehicle_id: vehicleData.id });
      const sortedDeals = (deals || []).sort((a, b) => new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime());
      setDealHistory(sortedDeals);
    } catch (error) { console.error('Error loading deal history:', error); }
  };

  const checkShortlistStatus = async (vehicleId, dealer) => {
    if (!dealer) return;
    try {
      const shortlists = await Shortlist.filter({ dealer_id: dealer.id });
      const isInAny = (shortlists || []).some(s => (s.vehicle_ids || []).includes(vehicleId));
      setIsInShortlist(isInAny);
    } catch (error) { console.error('Error checking shortlist:', error); }
  };

  const trackVehicleView = async (vehicleId, user) => {
    setViewCount(prev => prev + 1);
    if (user) {
      try {
        await AuditLog.create({
          target_id: vehicleId,
          target_type: 'Vehicle',
          actor_email: user.email,
          action: 'view',
          details: 'Vehicle detail page viewed'
        });
      } catch (error) { console.error('Error tracking view:', error); }
    }
  };

  const loadInspections = async (vehicleId) => {
    try {
      const inspectionData = await VehicleInspection.filter({ vehicle_id: vehicleId });
      const sortedInspections = (inspectionData || []).sort((a, b) => new Date(b.inspection_date || 0).getTime() - new Date(a.inspection_date || 0).getTime());
      setInspections(sortedInspections);
    } catch (error) {
      console.error('Error loading inspections:', error);
      setInspections([]);
    }
  };

  const handleToggleShortlist = async () => {
    if (!currentDealer) {
      toast({ title: "Login Required", description: "Please log in to manage shortlists.", variant: "destructive" });
      return;
    }
    
    try {
      let shortlists = await Shortlist.filter({ dealer_id: currentDealer.id, name: 'My Favorites' });
      let favShortlist = shortlists[0];
      
      if (!favShortlist) {
        favShortlist = await Shortlist.create({ name: 'My Favorites', dealer_id: currentDealer.id, vehicle_ids: [] });
      }

      const vehicleIds = favShortlist.vehicle_ids || [];
      const isCurrentlyInList = vehicleIds.includes(vehicle.id);
      const updatedIds = isCurrentlyInList ? vehicleIds.filter(id => id !== vehicle.id) : [...vehicleIds, vehicle.id];

      await Shortlist.update(favShortlist.id, { vehicle_ids: updatedIds });
      setIsInShortlist(!isCurrentlyInList);
      toast({ title: !isCurrentlyInList ? "Added to Shortlist" : "Removed from Shortlist" });
    } catch (error) {
      console.error("Failed to update shortlist:", error);
      toast({ title: "Error", description: "Could not update shortlist.", variant: "destructive" });
    }
  };

  const handleInspectionComplete = (inspectionData) => {
    setShowInspectorPanel(false);
    loadInspections(vehicle.id);
    toast({ title: "Inspection Completed", description: "Vehicle inspection has been recorded successfully." });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-100 text-slate-700", live: "bg-green-100 text-green-700",
      in_deal: "bg-blue-100 text-blue-700", sold: "bg-purple-100 text-purple-700",
      archived: "bg-slate-100 text-slate-500"
    };
    return colors[status] || colors.draft;
  };

  const renderCustomAttributes = () => {
    const attributes = safeGet(vehicle, 'custom_attributes', {});
    if (!attributes || Object.keys(attributes).length === 0) return null;
    return (
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(attributes).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-slate-600">{CATEGORY_FIELD_LABELS[key] || key.replace(/_/g, ' ')}:</span>
            <span className="font-medium">{String(value ?? '')}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderInspectionHistory = () => {
    if (inspections.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No inspection reports available.</p>
          {permissions.canInspect && <Button onClick={() => setShowInspectorPanel(true)} className="mt-4">Start New Inspection</Button>}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {permissions.canInspect && (
          <div className="mb-4 text-right">
            <Button onClick={() => setShowInspectorPanel(true)}>New Inspection</Button>
          </div>
        )}
        
        {inspections.map((inspection, index) => (
          <Card key={inspection.id} className={index === 0 ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Inspection Report {index === 0 && <Badge className="ml-2">Latest</Badge>}</CardTitle>
                  <p className="text-sm text-slate-600">{formatDate(inspection.inspection_date, 'datetime')} by {inspection.inspector_id || 'System'}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < inspection.overall_rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />)}
                  </div>
                  <span className="text-sm text-slate-600">{inspection.overall_rating}/5 Overall</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {inspection.category_ratings && Object.keys(inspection.category_ratings).length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Category Ratings</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(inspection.category_ratings).map(([category, rating]) => (
                        <div key={category} className="flex justify-between">
                          <span className="capitalize">{category.replace(/_/g, ' ')}:</span>
                          <span>{Number(rating)}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {inspection.defects && inspection.defects.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Identified Issues ({inspection.defects.length})</h5>
                    <div className="space-y-2">
                      {inspection.defects.slice(0, 3).map((defect, defectIndex) => (
                        <div key={defectIndex} className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className={
                            defect.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            defect.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                            defect.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                          }>{defect.severity}</Badge>
                          <span>{defect.description}</span>
                        </div>
                      ))}
                      {inspection.defects.length > 3 && <p className="text-xs text-slate-500">+{inspection.defects.length - 3} more issues</p>}
                    </div>
                  </div>
                )}
                {inspection.estimated_refurbishment_cost > 0 && (
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm font-medium">Est. Refurbishment Cost:</span>
                    <span className="font-bold text-orange-700">{formatCurrency(inspection.estimated_refurbishment_cost)}</span>
                  </div>
                )}
                {inspection.recommendations && (
                  <div>
                    <h5 className="font-medium mb-1">Recommendations</h5>
                    <p className="text-sm text-slate-600">{inspection.recommendations}</p>
                  </div>
                )}
                {inspection.report_url && (
                  <div className="flex justify-end pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={inspection.report_url} target="_blank" rel="noopener noreferrer"><Download className="w-4 h-4 mr-2" /> View Full Report</a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" /><p className="text-slate-600">Loading vehicle details...</p></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6"><AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h2 className="text-xl font-semibold mb-2">Vehicle Not Found</h2><p className="text-slate-600 mb-4">{error}</p><Button onClick={() => navigate(-1)}>Go Back</Button></CardContent>
        </Card>
      </div>
    );
  }

  const vehicleCategories = ensureArray(vehicle.vehicle_category);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />{vehicle.location_city}, {vehicle.location_state}
                  <Badge className={getStatusColor(vehicle.status)}>{vehicle.status.replace('_', ' ').toUpperCase()}</Badge>
                  {vehicleCategories.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-slate-500"><Eye className="w-4 h-4" />{viewCount} views</div>
              <Button variant="outline" size="sm" onClick={handleToggleShortlist} className={isInShortlist ? 'text-red-500 border-red-300' : ''}><Heart className={`w-4 h-4 mr-2 ${isInShortlist ? 'fill-current' : ''}`} />{isInShortlist ? 'Saved' : 'Save'}</Button>
              <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}><Share2 className="w-4 h-4 mr-2" />Share</Button>
              {permissions.canInspect && <Button variant="outline" size="sm" onClick={() => setShowInspectorPanel(true)} className="gap-2"><FileText className="w-4 h-4" />Inspect</Button>}
              {permissions.canEdit && <Link to={createPageUrl(`EditVehicle?id=${vehicle.id}`)}><Button variant="outline" size="sm" className="gap-2"><Edit className="w-4 h-4" />Edit</Button></Link>}
              {permissions.canMakeOffer && <Button onClick={() => setShowOfferModal(true)} className="gap-2"><Handshake className="w-4 h-4" />Make Offer</Button>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VehicleMediaGallery
              images={vehicle.images || []}
              videos={vehicle.videos || []}
              onImageClick={(index) => {
                setGalleryStartIndex(index);
                setShowGallery(true);
              }}
            />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-green-600 mb-2">
                  {isUserVerified ? (
                    formatCurrency(vehicle.asking_price)
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-lg">
                        {isUnderReview 
                          ? 'Price hidden - Verification under review' 
                          : 'Price hidden - Complete KYB verification'
                        }
                      </span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Year:</span><span className="font-medium">{vehicle.year}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Fuel:</span><span className="font-medium capitalize">{vehicle.fuel_type}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">KMs:</span><span className="font-medium">{formatKilometers(vehicle.kilometers)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Owner:</span><span className="font-medium capitalize">{vehicle.ownership}</span></div>
                </div>
                {renderCustomAttributes()}
                {inspections.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Latest Inspection</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < inspections[0].overall_rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />)}
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">{formatDate(inspections[0].inspection_date)}</p>
                  </div>
                )}
                
                {/* KYB Verification Notice for Unverified Users */}
                {!isUserVerified && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {isUnderReview 
                          ? 'Verification under review - View profile for updates' 
                          : 'Complete KYB verification to view pricing and dealer details'
                        }
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {permissions.canMakeOffer && isUserVerified && (
                    <Button 
                      onClick={() => setShowOfferModal(true)} 
                      className="w-full gap-2"
                      title="Make an offer on this vehicle"
                    >
                      <Handshake className="w-4 h-4" />
                      Make Offer
                    </Button>
                  )}
                  {permissions.canMakeOffer && !isUserVerified && (
                    <Button 
                      onClick={() => window.location.href = isUnderReview ? '/Profile' : '/OnboardingWizard'} 
                      className="w-full gap-2"
                      title={isUnderReview ? "View profile for verification updates" : "Complete KYB verification to make offers"}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isUnderReview ? "View Profile" : "Complete KYB First"}
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setShowEMICalculator(true)} className="gap-2"><Calculator className="w-4 h-4" />EMI</Button>
                    <Button variant="outline" onClick={() => setShowShareModal(true)} className="gap-2"><Share2 className="w-4 h-4" />Share</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {dealer && isUserVerified && (
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5" />Dealer Information</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dealer.business_name}</span>
                      {dealer.verification_status === 'verified' && <Badge className="bg-green-100 text-green-700"><ShieldCheck className="w-3 h-3 mr-1" />Verified</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="w-4 h-4" />{dealer.city}, {dealer.state}</div>
                    {dealer.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-current text-yellow-400" /><span className="font-medium">{dealer.rating.toFixed(1)}</span></div>
                        <span className="text-sm text-slate-500">({dealer.total_deals} deals)</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1"><Phone className="w-4 h-4 mr-2" />Call</Button>
                      <Button variant="outline" size="sm" className="flex-1"><MessageCircle className="w-4 h-4 mr-2" />Chat</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="inspection">Inspection</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6">
              <div className="grid md:grid-cols-1 gap-6">
                <div><h3 className="text-lg font-semibold mb-4">Description</h3><p className="text-slate-600 leading-relaxed">{vehicle.description || 'No description provided.'}</p></div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Registration:</span><span className="font-medium">{vehicle.registration_number}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Make:</span><span className="font-medium">{vehicle.make}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Model:</span><span className="font-medium">{vehicle.model}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Variant:</span><span className="font-medium">{vehicle.variant || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Color:</span><span className="font-medium capitalize">{vehicle.color || 'N/A'}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Technical Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Transmission:</span><span className="font-medium capitalize">{vehicle.transmission}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Fuel Type:</span><span className="font-medium capitalize">{vehicle.fuel_type}</span></div>
                    {renderCustomAttributes()}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inspection" className="p-6">{renderInspectionHistory()}</TabsContent>
            <TabsContent value="documents" className="p-6"><div className="text-center py-8"><FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Document management feature coming soon.</p></div></TabsContent>
            <TabsContent value="history" className="p-6"><div className="text-center py-8"><History className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">History tracking feature coming soon.</p></div></TabsContent>
            
            <TabsContent value="analytics" className="p-6">
              {permissions.canViewFinancials ? (
                <MarketplaceMetrics viewCount={viewCount} isOwner={permissions.isOwner} />
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">Analytics are only available to vehicle owners and administrators.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {relatedVehicles.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Related Vehicles</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {relatedVehicles.map(relatedVehicle => (
                  <Link key={relatedVehicle.id} to={createPageUrl(`VehicleDetail?id=${relatedVehicle.id}`)}>
                    <div className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-slate-100 rounded mb-2">
                        {relatedVehicle.images?.[0] && <img src={relatedVehicle.images[0]} alt={`${relatedVehicle.make} ${relatedVehicle.model}`} className="w-full h-full object-cover rounded" />}
                      </div>
                      <h4 className="font-medium text-sm">{relatedVehicle.year} {relatedVehicle.make} {relatedVehicle.model}</h4>
                      <p className="text-sm font-bold text-blue-600">
                        {isUserVerified ? (
                          formatCurrency(relatedVehicle.asking_price)
                        ) : (
                          <span className="text-amber-600 text-xs">Price hidden</span>
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showGallery && (
        <FullScreenGallery
          images={vehicle?.images || []}
          initialIndex={galleryStartIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
      {showOfferModal && isUserVerified && (
        <OfferModal
          vehicle={vehicle}
          dealer={dealer}
          currentDealer={currentDealer}
          onClose={() => setShowOfferModal(false)}
        />
      )}
      {showShareModal && <ShareModal vehicle={vehicle} onClose={() => setShowShareModal(false)} />}
      {showEMICalculator && <EMICalculator vehiclePrice={vehicle?.asking_price || 0} onClose={() => setShowEMICalculator(false)} />}
      {showInspectorPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <div className="max-w-4xl mx-auto w-full">
              <div className="bg-white rounded-lg shadow-xl">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold">Vehicle Inspection</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowInspectorPanel(false)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="p-6">
                  <InspectorPanel vehicle={vehicle} onInspectionComplete={handleInspectionComplete} existingInspection={null} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}