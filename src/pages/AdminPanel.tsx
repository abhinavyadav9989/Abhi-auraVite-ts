import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { Dealer, Vehicle, Transaction } from '@/api/entities';

import AdminReviewPanel from '../components/kyb/AdminReviewPanel';

export default function AdminPanel() {
  const [pendingKYB, setPendingKYB] = useState([]);
  const [disputedDeals, setDisputedDeals] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionNotes, setRejectionNotes] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load pending KYB verifications
      const dealers = await Dealer.filter({ verification_status: 'pending' });
      setPendingKYB(dealers);

      // Load disputed transactions
      const disputes = await Transaction.filter({ status: 'disputed' });
      setDisputedDeals(disputes);

      // Mock system alerts
      setSystemAlerts([
        {
          id: 1,
          type: 'security',
          title: 'Suspicious Activity Detected',
          description: 'Multiple failed login attempts from IP 192.168.1.100',
          severity: 'high',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'system',
          title: 'Server Performance Alert',
          description: 'API response time above threshold (>2s)',
          severity: 'medium',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
    setIsLoading(false);
  };

  const handleKYBReview = (dealerId) => {
    setSelectedReview(dealerId);
  };

  const handleReviewComplete = async (decision) => {
    // Refresh the pending list
    await loadAdminData();
    setSelectedReview(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-700',
      verified: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      disputed: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  if (selectedReview) {
    const selectedDealer = pendingKYB.find(d => d.id === selectedReview);
    const handleVerify = async (action: string) => {
      const update: any = {};
      if (action === 'approve') {
        update.verification_status = 'verified';
      } else if (action === 'reject') {
        update.verification_status = 'rejected';
        update.verification_notes = rejectionNotes;
      } else if (action === 'flag') {
        update.is_flagged = !selectedDealer?.is_flagged;
      }
      await Dealer.update(selectedReview, update);
      await handleReviewComplete(action);
      // Move to next pending review
      const currentIndex = pendingKYB.findIndex(d => d.id === selectedReview);
      const nextDealer = pendingKYB[currentIndex + 1];
      if (nextDealer) {
        setSelectedReview(nextDealer.id);
      } else {
        setSelectedReview(null);
      }
    };

    return (
      <AdminReviewPanel
        dealer={selectedDealer}
        onVerify={handleVerify}
        rejectionNotes={rejectionNotes}
        setRejectionNotes={setRejectionNotes}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
            <p className="text-slate-600 dark:text-slate-300">Monitor and manage platform operations</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{pendingKYB.length}</div>
              <div className="text-sm text-slate-600">Pending KYB</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{disputedDeals.length}</div>
              <div className="text-sm text-slate-600">Disputed Deals</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">1,247</div>
              <div className="text-sm text-slate-600">Active Dealers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">89%</div>
              <div className="text-sm text-slate-600">System Health</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="kyb" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kyb" className="relative">
              KYB Review
              {pendingKYB.length > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white text-xs">
                  {pendingKYB.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="disputes">
              Disputes
              {disputedDeals.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {disputedDeals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="kyb" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pending KYB Verifications</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search dealers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pendingKYB.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-600">No pending KYB verifications at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingKYB.map(dealer => (
                      <div key={dealer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{dealer.business_name}</h4>
                            <p className="text-sm text-slate-600">{dealer.owner_name} • {dealer.city}, {dealer.state}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(dealer.verification_status)}>
                                {dealer.verification_status.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                Applied {new Date(dealer.created_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleKYBReview(dealer.id)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Disputed Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {disputedDeals.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Disputes</h3>
                    <p className="text-slate-600">All transactions are proceeding smoothly.</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <p className="text-slate-600">Dispute resolution system coming soon...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-slate-600">Advanced analytics dashboard coming soon...</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map(alert => (
                    <div key={alert.id} className={`p-4 border-l-4 rounded-r-lg ${
                      alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900">{alert.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                        </div>
                        <Badge className={
                          alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}