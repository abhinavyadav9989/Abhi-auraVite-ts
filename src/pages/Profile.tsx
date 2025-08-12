
import React, { useState, useEffect } from "react";
import { Dealer } from "@/api/entities";
import { DealerDocument } from "@/api/entities";
import { DealerHours } from "@/api/entities";
import { DealerReview } from "@/api/entities";
import { Vehicle } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
  Edit,
  Upload,
  Download,
  Star,
  Flag,
  Reply,
  Copy,
  QrCode,
  Calendar,
  FileText,
  TrendingUp,
  Award,
  Camera,
  Globe,
  MessageSquare,
  BarChart3,
  Shield,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { format, isWithinInterval, parse } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// Components for different sections
import ProfileOverview from "../components/profile/ProfileOverview";
import BusinessHours from "../components/profile/BusinessHours";
import DocumentLocker from "../components/profile/DocumentLocker";
import ReviewsSection from "../components/profile/ReviewsSection";
import PerformanceMetrics from "../components/profile/PerformanceMetrics";
import PublicProfileShare from "../components/profile/PublicProfileShare";

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const DOCUMENT_TYPES = [
  { value: 'trade_licence', label: 'Trade Licence', required: true },
  { value: 'gst_certificate', label: 'GST Certificate', required: true },
  { value: 'pan_card', label: 'PAN Card', required: true },
  { value: 'address_proof', label: 'Address Proof', required: true },
  { value: 'bank_statement', label: 'Bank Statement', required: false },
  { value: 'other', label: 'Other Documents', required: false }
];

export default function Profile() {
  const [dealer, setDealer] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('staff'); // owner, staff, admin
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate(); // Initialize useNavigate

  // Form states with proper defaults
  const [profileForm, setProfileForm] = useState({
    business_name: "",
    owner_name: "",
    gstin: "",
    pan_number: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    tagline: "",
    website: "",
    description: ""
  });
  const [documents, setDocuments] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Determine user role
      const role = currentUser.role === 'admin' ? 'admin' : 'owner'; // Simplified for demo
      setUserRole(role);
      
      const dealerProfile = await Dealer.filter({ created_by: currentUser.email });
      if (dealerProfile.length > 0) {
        const dealerData = dealerProfile[0];
        setDealer(dealerData);
        
        // Set form data
        setProfileForm({
          business_name: dealerData.business_name || "",
          owner_name: dealerData.owner_name || "",
          gstin: dealerData.gstin || "",
          pan_number: dealerData.pan_number || "",
          phone: dealerData.phone || "",
          whatsapp: dealerData.whatsapp || "",
          address: dealerData.address || "",
          city: dealerData.city || "",
          state: dealerData.state || "",
          tagline: dealerData.tagline || "",
          website: dealerData.website || "",
          description: dealerData.description || ""
        });

        // Load related data
        await Promise.all([
          loadDocuments(dealerData.id),
          loadBusinessHours(dealerData.id),
          loadReviews(dealerData.id),
          loadVehicles(dealerData.id)
        ]);
      } else {
        // No dealer profile found, redirect to onboarding
        navigate(createPageUrl('OnboardingPath'));
        return; // Prevent further loading if redirecting
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
    }
    setIsLoading(false);
  };

  const loadDocuments = async (dealerId) => {
    try {
      const docs = await DealerDocument.filter({ dealer_id: dealerId });
      setDocuments(docs || []);
      
      // Debug logs to check document types
      console.log('Documents fetched:', docs);
      console.log('Document types in database:', docs?.map(d => d.document_type) || []);
      console.log('Expected document types:', DOCUMENT_TYPES.map(d => d.value));
      console.log('Matching documents:', docs?.filter(d => DOCUMENT_TYPES.some(dt => dt.value === d.document_type)) || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    }
  };

  const loadBusinessHours = async (dealerId) => {
    try {
      const hours = await DealerHours.filter({ dealer_id: dealerId });
      
      // If no hours exist, create default ones
      if (!hours || hours.length === 0) {
        const defaultHours = DAYS_OF_WEEK.map((day, index) => ({
          dealer_id: dealerId,
          day_of_week: index,
          is_open: index >= 1 && index <= 6, // Monday to Saturday
          open_time: "10:00",
          close_time: "19:00"
        }));
        
        const createdHours = await Promise.all(
          defaultHours.map(hour => DealerHours.create(hour))
        );
        setBusinessHours(createdHours || []);
      } else {
        setBusinessHours(hours.sort((a, b) => a.day_of_week - b.day_of_week));
      }
    } catch (error) {
      console.error("Error loading business hours:", error);
      setBusinessHours([]);
    }
  };

  const loadReviews = async (dealerId) => {
    try {
      const reviewData = await DealerReview.filter({ dealer_id: dealerId });
      setReviews(reviewData || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    }
  };

  const loadVehicles = async (dealerId) => {
    try {
      const vehicleData = await Vehicle.filter({ dealer_id: dealerId, status: 'live' });
      setVehicles(vehicleData || []);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      setVehicles([]);
    }
  };

  // PF-01: Edit business details
  const handleProfileUpdate = async () => {
    if (!dealer?.id) {
      toast({ title: "Error", description: "Dealer information not available.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await Dealer.update(dealer.id, profileForm);
      setDealer({ ...dealer, ...profileForm });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
    setIsSaving(false);
  };

  // PF-02: Upload logo/banner
  const handleFileUpload = async (file, type) => {
    // Add more robust check for file object
    if (!file || typeof file !== 'object' || !file.size || !dealer?.id) {
      toast({ title: "Error", description: "Invalid file selected. Please try again.", variant: "destructive" });
      return;
    }

    // Add file size validation
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({ title: "Error", description: "File must be less than 2MB", variant: "destructive" });
      return;
    }

    try {
      setUploadingDoc(type);
      // Mock file upload - in real app would use UploadFile integration
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      const mockUrl = URL.createObjectURL(file);
      
      const updateData = type === 'logo' ? { logo_url: mockUrl } : { banner_url: mockUrl };
      await Dealer.update(dealer.id, updateData);
      
      setDealer({ ...dealer, ...updateData });
      toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!` });
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({ title: "Error", description: `Failed to upload ${type}`, variant: "destructive" });
    } finally {
      setUploadingDoc(null);
    }
  };

  // PF-17: Update business hours
  const handleHoursUpdate = async (dayIndex, field, value) => {
    try {
      const hourToUpdate = businessHours.find(h => h.day_of_week === dayIndex);
      if (hourToUpdate) {
        const updatedHour = { ...hourToUpdate, [field]: value };
        await DealerHours.update(hourToUpdate.id, { [field]: value });
        
        setBusinessHours(prev => 
          prev.map(h => h.day_of_week === dayIndex ? updatedHour : h)
        );
      }
    } catch (error) {
      console.error("Error updating hours:", error);
      toast({ title: "Error", description: "Failed to update hours", variant: "destructive" });
    }
  };

  // PF-18: Check if currently open
  const isCurrentlyOpen = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = format(now, 'HH:mm');
    
    const todayHours = businessHours.find(h => h.day_of_week === currentDay);
    if (!todayHours || !todayHours.is_open) return false;
    
    const openTime = parse(todayHours.open_time, 'HH:mm', new Date());
    const closeTime = parse(todayHours.close_time, 'HH:mm', new Date());
    const currentDateTime = parse(currentTime, 'HH:mm', new Date());
    
    return isWithinInterval(currentDateTime, { start: openTime, end: closeTime });
  };

  // Utility functions
  const canEdit = () => userRole === 'owner' || userRole === 'admin';
  const canViewMetrics = () => userRole === 'owner' || userRole === 'admin'; // DD-14
  
  const getVerificationStatus = () => {
    if (!dealer) return null;
    
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'Pending Verification' },
      verified: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Verified Business' },
      rejected: { color: 'bg-red-100 text-red-700', icon: AlertCircle, text: 'Verification Rejected' },
      provisional: { color: 'bg-blue-100 text-blue-700', icon: Clock, text: 'Provisional Access' }
    };
    
    return statusConfig[dealer.verification_status] || statusConfig.pending;
  };

  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    return (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1);
  };

  const getInspectionCoverage = () => {
    if (!vehicles || vehicles.length === 0) return 0;
    const inspected = vehicles.filter(v => v.inspection_status === 'completed').length;
    return Math.round((inspected / vehicles.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64" />
            <div className="h-64 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();
  const StatusIcon = verificationStatus?.icon || Clock;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* PF-02: Logo display */}
            <div className="relative">
              <Avatar className="w-16 h-16 md:w-20 md:h-20">
                {dealer?.logo_url ? (
                  <img src={dealer.logo_url} alt="Business Logo" className="object-cover" />
                ) : (
                  <AvatarFallback className="text-xl">
                    {dealer?.business_name?.[0]?.toUpperCase() || 'D'}
                  </AvatarFallback>
                )}
              </Avatar>
              {canEdit() && (
                <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, 'logo');
                      }
                    }}
                  />
                </label>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {dealer?.business_name || 'Loading...'}
                </h1>
                {/* PF-07: KYB verification badge */}
                {verificationStatus && (
                  <Badge className={`${verificationStatus.color} gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {verificationStatus.text}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {dealer?.city || 'N/A'}, {dealer?.state || 'N/A'}
                </div>
                
                {/* PF-09: Response time */}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Responds in ~2h
                </div>
                
                {/* Rating display */}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {getAverageRating()} ({reviews.length} reviews)
                </div>
                
                {/* PF-18: Current status */}
                <Badge variant={isCurrentlyOpen() ? "default" : "secondary"} className="gap-1">
                  <div className={`w-2 h-2 rounded-full ${isCurrentlyOpen() ? 'bg-green-500' : 'bg-slate-400'}`} />
                  {isCurrentlyOpen() ? 'Open Now' : 'Closed'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canEdit() && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                
                {isEditing && (
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </>
            )}
            
            {/* PF-26: Public profile sharing */}
            <PublicProfileShare dealer={dealer} />
          </div>
        </div>

        {/* Messages */}
        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Hours</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            
            {/* DD-14: Conditionally render metrics tab */}
            {canViewMetrics() ? (
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Metrics</span>
              </TabsTrigger>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center gap-2 text-slate-400 cursor-not-allowed p-2">
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Metrics</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Only owners can view performance metrics.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TabsTrigger value="share" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Public</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ProfileOverview
              dealer={dealer}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              vehicles={vehicles}
              isEditing={isEditing}
              canEdit={canEdit()}
              onFileUpload={handleFileUpload}
              uploadingDoc={uploadingDoc}
              inspectionCoverage={getInspectionCoverage()}
            />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <ReviewsSection
              reviews={reviews}
              dealer={dealer}
              userRole={userRole}
              canEdit={canEdit()}
              onReviewUpdate={loadReviews}
            />
          </TabsContent>

          {/* Business Hours Tab */}
          <TabsContent value="hours" className="space-y-6">
            <BusinessHours
              businessHours={businessHours}
              onHoursUpdate={handleHoursUpdate}
              canEdit={canEdit()}
              isCurrentlyOpen={isCurrentlyOpen()}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <DocumentLocker
              documents={documents}
              dealer={dealer}
              userRole={userRole}
              onDocumentUpdate={loadDocuments}
              documentTypes={DOCUMENT_TYPES}
            />
          </TabsContent>

          {/* Performance Metrics Tab (Private) */}
          {canViewMetrics() && (
            <TabsContent value="metrics" className="space-y-6">
              <PerformanceMetrics
                dealer={dealer}
                vehicles={vehicles}
                reviews={reviews}
              />
            </TabsContent>
          )}

          {/* Public Profile Tab */}
          <TabsContent value="share" className="space-y-6">
            <PublicProfileShare
              dealer={dealer}
              vehicles={vehicles}
              reviews={reviews}
              businessHours={businessHours}
              isCurrentlyOpen={isCurrentlyOpen()}
              inspectionCoverage={getInspectionCoverage()}
              expanded={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
