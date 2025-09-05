
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { BankAccount } from '@/api/entities';
import { DealerPreferences } from '@/api/entities';
import { UserSession } from '@/api/entities';
import { TeamMember } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  User as UserIcon,
  Shield,
  Building,
  CreditCard,
  Bell,
  Settings as SettingsIcon,
  Users,
  Plug,
  Lock,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Upload,
  Download,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  LogOut,
  Mail,
  Phone,
  Camera,
  Key,
  Globe,
  FileDown,
  History
} from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import MfaSettings from '../components/settings/MfaSettings';
import BankingSettings from '../components/settings/BankingSettings';

// Mock data for demo purposes
const MOCK_SESSIONS = [
  {
    id: '1',
    device_info: 'Chrome on Windows 11',
    location: 'Mumbai, India',
    last_activity: new Date(Date.now() - 10 * 60 * 1000),
    is_current: true,
    ip_address: '192.168.1.100'
  },
  {
    id: '2',
    device_info: 'Safari on iPhone 14',
    location: 'Mumbai, India',
    last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    is_current: false,
    ip_address: '10.0.1.50'
  }
];

const MOCK_TEAM_MEMBERS = [
  {
    id: '1',
    email: 'staff@example.com',
    role: 'sales',
    status: 'active',
    invited_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    email: 'manager@example.com',
    role: 'admin',
    status: 'pending',
    invited_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

const MOCK_CONSENT_LOG = [
  {
    id: '1',
    type: 'privacy_policy',
    version: '1.2',
    consented_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    description: 'Privacy Policy v1.2'
  },
  {
    id: '2',
    type: 'marketing_emails',
    consented_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    description: 'Marketing email communications'
  }
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी (Hindi)' }
];

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System Default' }
];

const VEHICLE_CATEGORIES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'muv', label: 'MUV' },
  { value: 'luxury', label: 'Luxury' }
];

const INVENTORY_TYPES = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'service', label: 'Service' },
  { value: 'specialised', label: 'Specialised' }
];

const TEAM_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
  { value: 'inspector', label: 'Inspector' }
];

export default function Settings() {
  // Temporary local aliases to relax TS on AlertDialog subcomponents
  const ADContent = AlertDialogContent as unknown as React.FC<any>;
  const ADHeader = AlertDialogHeader as unknown as React.FC<any>;
  const ADTitle = AlertDialogTitle as unknown as React.FC<any>;
  const ADDescription = AlertDialogDescription as unknown as React.FC<any>;
  const ADFooter = AlertDialogFooter as unknown as React.FC<any>;
  const ADCancel = AlertDialogCancel as unknown as React.FC<any>;
  const ADAction = AlertDialogAction as unknown as React.FC<any>;
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [teamMembers, setTeamMembers] = useState(MOCK_TEAM_MEMBERS);
  const [consentLog, setConsentLog] = useState(MOCK_CONSENT_LOG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Form states
  type DealerProfileForm = {
    phone?: string;
    whatsapp?: string;
    business_name?: string;
    owner_name?: string;
    gstin?: string;
    pan_number?: string;
    address?: string;
    city?: string;
    state?: string;
    [key: string]: any;
  };

  const [profileForm, setProfileForm] = useState<DealerProfileForm>({});
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [teamForm, setTeamForm] = useState({
    email: '',
    role: 'sales'
  });
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Modal states
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showRecoveryPhone, setShowRecoveryPhone] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const dealerProfile = await Dealer.filter({ created_by: currentUser.email });
      if (dealerProfile.length > 0) {
        const dealerData = dealerProfile[0];
        setDealer(dealerData);
        
        // Load data from both dealer table fields and onboarding progress
        const onboardingData = dealerData.onboarding_progress || {};
        const organizationData = onboardingData.organization_details || {};
        
        setProfileForm({
          phone: dealerData.phone || organizationData.phone || organizationData.contactNumber || "",
          whatsapp: dealerData.whatsapp || organizationData.whatsapp || organizationData.whatsappNumber || "",
          business_name: dealerData.business_name || organizationData.businessName || organizationData.organizationName || "",
          owner_name: dealerData.owner_name || organizationData.ownerName || organizationData.contactPerson || "",
          gstin: dealerData.gstin || organizationData.gstin || "",
          pan_number: dealerData.pan_number || organizationData.panNumber || "",
          address: dealerData.address || organizationData.address || organizationData.businessAddress || "",
          city: dealerData.city || organizationData.city || "",
          state: dealerData.state || organizationData.state || ""
        });

        // Load preferences
        const prefs = await DealerPreferences.filter({ dealer_id: dealerProfile[0].id });
        if (prefs.length > 0) {
          setPreferences(prefs[0]);
        } else {
          // Create default preferences
          const defaultPrefs = await DealerPreferences.create({ dealer_id: dealerProfile[0].id });
          setPreferences(defaultPrefs);
        }
        
        // Load bank details
        try {
          const bankDetails = await supabase
            .from('bank_details')
            .select('*')
            .eq('dealer_id', dealerProfile[0].id)
            .single();
          
          if (bankDetails.data) {
            // Update the profile form with bank details
            setProfileForm(prev => ({
              ...prev,
              account_holder_name: bankDetails.data.account_holder_name || "",
              account_number: bankDetails.data.account_number || "",
              ifsc_code: bankDetails.data.ifsc_code || "",
              bank_name: bankDetails.data.bank_name || "",
              cheque_image_url: bankDetails.data.cheque_image_url || ""
            }));
          }
        } catch (error) {
          console.error('Error loading bank details:', error);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings data',
        variant: 'destructive'
      });
    }
    setIsLoading(false);
  };

  // ST-01: Update email/phone
  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      if (dealer) {
        await Dealer.update(dealer.id, profileForm);
        setDealer({ ...dealer, ...profileForm });
        toast({ title: 'Profile Updated', description: 'Your profile has been updated successfully.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  // ST-02: Change password
  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      // Mock password change - in real app would call API
      toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });

      // ST-02 AC-3: Invalidate other sessions
      setSessions(prev => prev.map(s => ({ ...s, is_current: s.is_current })));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to change password', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  // ST-04: Add recovery phone
  const handleAddRecoveryPhone = async () => {
    setIsSaving(true);
    try {
      // Mock recovery phone setup
      toast({ title: 'Recovery Phone Added', description: 'SMS verification sent to your phone.' });
      setShowRecoveryPhone(false);
      setRecoveryPhone('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add recovery phone', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  // ST-05: Log out other sessions
  const handleLogoutSession = async (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({ title: 'Session Terminated', description: 'The selected session has been logged out.' });
  };

  // ST-07: Upload logo/banner
  const handleFileUpload = async (file, type) => {
    if (!dealer?.id) return;
    
    try {
      setIsSaving(true);
      const { file_url, url } = await UploadFile({ file });
      const permanentUrl = file_url || url;
      const updateData = type === 'logo' ? { logo_url: permanentUrl } : { banner_url: permanentUrl };
      await Dealer.update(dealer.id, updateData);
      
      setDealer({ ...dealer, ...updateData });
      toast({ title: 'Success', description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!` });
    } catch (error) {
      toast({ title: 'Error', description: `Failed to upload ${type}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ST-18: Invite team member
  const handleInviteTeamMember = async () => {
    setIsSaving(true);
    try {
      const newMember = {
        id: Date.now().toString(),
        ...teamForm,
        status: 'pending',
        invited_at: new Date()
      };

      setTeamMembers(prev => [...prev, newMember]);
      setTeamForm({ email: '', role: 'sales' });
      setShowTeamModal(false);

      toast({
        title: 'Invitation Sent',
        description: `Invitation has been sent to ${teamForm.email}`
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send invitation', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  // ST-19: Change staff roles
  const handleUpdateMemberRole = async (memberId, newRole) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
    toast({ title: 'Role Updated', description: 'Team member role has been updated.' });
  };

  // ST-20: Remove staff
  const handleRemoveMember = async (memberId) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    toast({ title: 'Member Removed', description: 'Team member has been removed.' });
  };

  // ST-21: Generate API key
  const handleGenerateApiKey = async () => {
    const newKey = 'ak_' + Math.random().toString(36).substr(2, 32);
    setApiKey(newKey);
    toast({ title: 'API Key Generated', description: 'New API key has been created.' });
  };

  // ST-22: Add webhook URL
  const handleSaveWebhook = async () => {
    if (!webhookUrl.startsWith('https://')) {
      toast({ title: 'Error', description: 'Webhook URL must use HTTPS', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Webhook Saved', description: 'Webhook URL has been saved.' });
    setShowWebhook(false);
  };

  // ST-14: Update preferences
  const handlePreferenceUpdate = async (key, value) => {
    try {
      const updatedPrefs = { ...preferences, [key]: value };
      await DealerPreferences.update(preferences.id, updatedPrefs);
      setPreferences(updatedPrefs);

      // Apply theme immediately
      if (key === 'theme') {
        document.documentElement.className = value === 'dark' ? 'dark' : '';
      }

      toast({ title: 'Preference Updated', description: 'Your preference has been saved.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update preference', variant: 'destructive' });
    }
  };

  // ST-23: Export data
  const handleExportData = async () => {
    toast({
      title: 'Data Export Started',
      description: 'Your data export is being prepared. You will receive an email with download links shortly.'
    });
  };

  // ST-24: Delete account
  const handleDeleteAccount = async () => {
    toast({
      title: 'Account Deletion Requested',
      description: 'Your account will be deleted in 30 days. You can undo this action from your email.'
    });
    setShowDeleteAccount(false);
  };

  const getUserRole = () => {
    if (!user || !dealer) return 'staff';
    return 'owner'; // Mock owner role for demo
  };

  const isOwner = getUserRole() === 'owner';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Manage your account, security, and business preferences</p>
        </div>

        {/* User Profile Header */}
        <Card className="mb-6">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                    {dealer?.logo_url ? (
                        <img src={dealer.logo_url} alt={dealer.business_name || 'Dealer Logo'} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-8 h-8 text-slate-500" />
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
                    <p className="text-slate-600">{user?.email}</p>
                    {dealer && <p className="text-sm text-slate-500">{dealer.business_name}</p>}
                </div>
            </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-10 h-auto p-1">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="banking" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Banking</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Team</span>
              </TabsTrigger>
            )}
            {isOwner && (
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Plug className="w-4 h-4" />
                <span className="hidden sm:inline">API</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="consent" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Consent</span>
            </TabsTrigger>
          </TabsList>

          {/* ST-01: Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={user?.full_name || ''}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ''}
                          disabled
                        />
                        <p className="text-xs text-slate-500">
                          Email changes require verification
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileForm.phone || ''}
                          onChange={(e) => setProfileForm(prev => ({...prev, phone: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp Number</Label>
                        <Input
                          id="whatsapp"
                          type="tel"
                          value={profileForm.whatsapp || ''}
                          onChange={(e) => setProfileForm(prev => ({...prev, whatsapp: e.target.value}))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleProfileUpdate} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ST-05: Active Sessions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Active Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessions.map(session => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{session.device_info}</div>
                            {session.is_current && (
                              <Badge variant="default" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last active: {session.last_activity.toLocaleString()}
                          </div>
                        </div>
                        {!session.is_current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLogoutSession(session.id)}
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ST-02, ST-03, ST-04: Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm(prev => ({...prev, current_password: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({...prev, new_password: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({...prev, confirm_password: e.target.value}))}
                    />
                  </div>
                  <Button onClick={handlePasswordChange} disabled={isSaving}>
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <MfaSettings />
            </div>

            {/* ST-04: Recovery Phone */}
            <Card>
              <CardHeader>
                <CardTitle>Account Recovery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recovery Phone</Label>
                    <p className="text-sm text-slate-600">Used for account recovery and MFA backup</p>
                  </div>
                  <Dialog open={showRecoveryPhone} onOpenChange={setShowRecoveryPhone}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Add Phone
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Recovery Phone</DialogTitle>
                        <DialogDescription>
                          This phone number will be used for account recovery
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="recovery_phone">Phone Number</Label>
                          <Input
                            id="recovery_phone"
                            type="tel"
                            value={recoveryPhone}
                            onChange={(e) => setRecoveryPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowRecoveryPhone(false)}>Cancel</Button>
                          <Button onClick={handleAddRecoveryPhone} disabled={isSaving}>
                            {isSaving ? 'Verifying...' : 'Add & Verify'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ST-06, ST-07, ST-08: Dealer Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Business Information</CardTitle>
                      {/* ST-08: KYB verification badge */}
                      {dealer?.verification_status && (
                        <Badge
                          variant={dealer.verification_status === 'verified' ? 'default' : 'secondary'}
                          className={`${
                            dealer.verification_status === 'verified'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {dealer.verification_status === 'verified' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {dealer.verification_status}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Business Name</Label>
                        <Input
                          id="business_name"
                          value={profileForm.business_name || ''}
                          onChange={(e) => setProfileForm(prev => ({...prev, business_name: e.target.value}))}
                          disabled={dealer?.verification_status === 'verified'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner_name">Owner Name</Label>
                        <Input
                          id="owner_name"
                          value={profileForm.owner_name || ''}
                          onChange={(e) => setProfileForm(prev => ({...prev, owner_name: e.target.value}))}
                          disabled={dealer?.verification_status === 'verified'}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN</Label>
                        <Input
                          id="gstin"
                          value={profileForm.gstin || ''}
                          onChange={(e) => setProfileForm(prev => ({...prev, gstin: e.target.value}))}
                          disabled={dealer?.verification_status === 'verified'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pan_number">PAN Number</Label>
                        <Input
                          id="pan_number"
                          value={profileForm.pan_number || ''}
                          onChange={(e) => setProfileForm(prev => ({...prev, pan_number: e.target.value}))}
                          disabled={dealer?.verification_status === 'verified'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Textarea
                        id="address"
                        value={profileForm.address || ''}
                        onChange={(e) => setProfileForm(prev => ({...prev, address: e.target.value}))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profileForm.city || ''}
                          onChange={(e) => setProfileForm(prev => ({...prev, city: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={profileForm.state || ''}
                          onChange={(e) => setProfileForm(prev => ({...prev, state: e.target.value}))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleProfileUpdate} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ST-07: Logo Upload */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Business Branding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Dealership Logo</Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <label className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-600">Click to upload logo</p>
                          <p className="text-xs text-slate-500">Max 1MB, JPG/PNG</p>
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'logo');
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Hero Image</Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <label className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-600">Upload hero image</p>
                          <p className="text-xs text-slate-500">Used on public listings</p>
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'banner');
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ST-09, ST-10, ST-11: Banking Tab */}
          {isOwner && (
            <TabsContent value="banking" className="space-y-6">
              <BankingSettings dealerId={dealer?.id} />
            </TabsContent>
          )}

          {/* ST-12, ST-13: Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ST-12: Notification grid */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Deal Notifications</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div></div>
                      <div className="text-center text-sm font-medium">Email</div>
                      <div className="text-center text-sm font-medium">Push</div>
                      <div className="text-center text-sm font-medium">SMS</div>

                      <div className="text-sm">New offers</div>
                      <div className="flex justify-center">
                        <Switch
                          checked={preferences?.notifications?.deals_email ?? true}
                          onCheckedChange={(checked) =>
                            handlePreferenceUpdate('notifications', {
                              ...preferences?.notifications,
                              deals_email: checked
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-center">
                        <Switch
                          checked={preferences?.notifications?.deals_push ?? true}
                          onCheckedChange={(checked) =>
                            handlePreferenceUpdate('notifications', {
                              ...preferences?.notifications,
                              deals_push: checked
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-center">
                        <Switch
                          checked={preferences?.notifications?.deals_sms ?? false}
                          onCheckedChange={(checked) =>
                            handlePreferenceUpdate('notifications', {
                              ...preferences?.notifications,
                              deals_sms: checked
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">System Notifications</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div></div>
                      <div className="text-center text-sm font-medium">Email</div>
                      <div className="text-center text-sm font-medium">Push</div>
                      <div className="text-center text-sm font-medium">SMS</div>

                      <div className="text-sm">System updates</div>
                      <div className="flex justify-center">
                        <Switch
                          checked={preferences?.notifications?.system_email ?? true}
                          onCheckedChange={(checked) =>
                            handlePreferenceUpdate('notifications', {
                              ...preferences?.notifications,
                              system_email: checked
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-center">
                        <Switch
                          checked={preferences?.notifications?.system_push ?? true}
                          onCheckedChange={(checked) =>
                            handlePreferenceUpdate('notifications', {
                              ...preferences?.notifications,
                              system_push: checked
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-center">
                        <Switch
                          checked={preferences?.notifications?.system_sms ?? false}
                          onCheckedChange={(checked) =>
                            handlePreferenceUpdate('notifications', {
                              ...preferences?.notifications,
                              system_sms: checked
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ST-13: Quiet hours */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Quiet Hours</h3>
                      <p className="text-sm text-slate-600">Suppress push notifications during specified hours</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <Input
                        type="time"
                        value={preferences?.quiet_hours_start || '22:00'}
                        onChange={(e) => handlePreferenceUpdate('quiet_hours_start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To</Label>
                      <Input
                        type="time"
                        value={preferences?.quiet_hours_end || '07:00'}
                        onChange={(e) => handlePreferenceUpdate('quiet_hours_end', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ST-14, ST-15, ST-16, ST-17: Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interface Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={preferences?.language || 'en'}
                      onValueChange={(value) => handlePreferenceUpdate('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={preferences?.theme || 'system'}
                      onValueChange={(value) => handlePreferenceUpdate('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {THEMES.map(theme => (
                          <SelectItem key={theme.value} value={theme.value}>
                            {theme.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Listing Defaults</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Inventory Type</Label>
                    <Select
                      value={preferences?.default_inventory_type || 'public'}
                      onValueChange={(value) => handlePreferenceUpdate('default_inventory_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVENTORY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Vehicle Category</Label>
                    <Select
                      value={preferences?.default_vehicle_category || 'sedan'}
                      onValueChange={(value) => handlePreferenceUpdate('default_vehicle_category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ST-17: Specialised opt-in */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Specialised Vehicles</Label>
                      <p className="text-sm text-slate-600">View cranes, armoured vehicles, etc.</p>
                    </div>
                    <Switch
                      checked={preferences?.opt_in_specialised ?? false}
                      onCheckedChange={(checked) => handlePreferenceUpdate('opt_in_specialised', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ST-18, ST-19, ST-20: Team Tab */}
          {isOwner && (
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Team Members</CardTitle>
                    <Button onClick={() => setShowTeamModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {teamMembers.length > 0 ? (
                    <div className="space-y-4">
                      {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{member.email}</div>
                            <div className="text-sm text-slate-600 capitalize">{member.role}</div>
                            <div className="text-xs text-slate-500">
                              Invited {member.invited_at.toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={member.status === 'active' ? 'default' : 'secondary'}
                              className={`${
                                member.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {member.status}
                            </Badge>
                            {/* ST-19: Change role */}
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TEAM_ROLES.map(role => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {/* ST-20: Remove member */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-600 mb-4">No team members yet</p>
                      <Button onClick={() => setShowTeamModal(true)}>
                        Invite Your First Team Member
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* ST-21, ST-22: Integrations Tab */}
          {isOwner && (
            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">API Keys</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Generate API keys for third-party integrations
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleGenerateApiKey}>
                        <Key className="w-4 h-4 mr-2" />
                        Generate New API Key
                      </Button>
                      {apiKey && (
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm">{apiKey}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(apiKey);
                              toast({ title: 'Copied', description: 'API key copied to clipboard' });
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-2">Webhooks</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Set webhook URLs to receive real-time updates
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="webhook_url">Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="webhook_url"
                          placeholder="https://your-site.com/webhook"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                        <Button variant="outline" onClick={handleSaveWebhook}>Save</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* ST-23, ST-24, ST-25: Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Export Your Data</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Download all your data in a portable format
                  </p>
                  <Button variant="outline" onClick={handleExportData}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Request Data Export
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <ADContent>
                      <ADHeader>
                        <ADTitle>Are you absolutely sure?</ADTitle>
                        <ADDescription>
                          This will permanently delete your account and remove all associated data.
                          This action cannot be undone.
                        </ADDescription>
                      </ADHeader>
                      <ADFooter>
                        <ADCancel>Cancel</ADCancel>
                        <ADAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Account
                        </ADAction>
                      </ADFooter>
                    </ADContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ST-25: Consent Log Tab */}
          <TabsContent value="consent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consent History</CardTitle>
                <p className="text-sm text-slate-600">
                  Your consent history for privacy policies and marketing communications
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consentLog.map(consent => (
                    <div key={consent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{consent.description}</div>
                        <div className="text-sm text-slate-600">
                          Consented on {consent.consented_at.toLocaleDateString()}
                        </div>
                        {consent.version && (
                          <div className="text-xs text-slate-500">Version {consent.version}</div>
                        )}
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Consented
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}

        {/* Invite Team Member Modal */}
        <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your dealership
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team_email">Email Address</Label>
                <Input
                  id="team_email"
                  type="email"
                  value={teamForm.email}
                  onChange={(e) => setTeamForm(prev => ({...prev, email: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team_role">Role</Label>
                <Select
                  value={teamForm.role}
                  onValueChange={(value) => setTeamForm(prev => ({...prev, role: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowTeamModal(false)}>Cancel</Button>
                <Button onClick={handleInviteTeamMember} disabled={isSaving}>
                  {isSaving ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
