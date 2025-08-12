
import React, { useState, useEffect } from "react";
import { Transaction } from "@/api/entities";
import { Vehicle } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { Payment } from "@/api/entities";
import { LogisticsOrder } from "@/api/entities";
import { RTOApplication } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Handshake, 
  Search,
  Filter,
  Eye,
  Archive,
  FileDown,
  Clock,
  IndianRupee,
  Star,
  MapPin,
  Truck,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";

import DealRow from "../components/deals/DealRow";
import BulkActionBar from "../components/deals/BulkActionBar";
import DealsFilters from "../components/deals/DealsFilters";
import EmptyDealsState from "../components/deals/EmptyDealsState";

const STATUS_TABS = [
  { id: "all", label: "All Deals", statuses: [] },
  { id: "active", label: "Active", statuses: ["offer_made", "negotiating", "accepted"] },
  { id: "payment", label: "Awaiting Payment", statuses: ["payment_pending"] },
  { id: "transit", label: "In Transit", statuses: ["paid", "picked_up", "in_transit", "delivered"] },
  { id: "completion", label: "Completing", statuses: ["rto_done"] },
  { id: "completed", label: "Completed", statuses: ["completed"] },
  { id: "issues", label: "Issues", statuses: ["cancelled", "disputed"] }
];

const STATUS_COLORS = {
  offer_made: "bg-blue-100 text-blue-700",
  negotiating: "bg-orange-100 text-orange-700", 
  accepted: "bg-green-100 text-green-700",
  payment_pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-purple-100 text-purple-700",
  picked_up: "bg-indigo-100 text-indigo-700",
  in_transit: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  rto_done: "bg-pink-100 text-pink-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  disputed: "bg-red-100 text-red-700"
};

export default function Deals() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, any>>({});
  const [dealers, setDealers] = useState<Record<string, any>>({});
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeals, setSelectedDeals] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: "all", // buyer, seller, all
    date_range: "all",
    inventory_type: "all"
  });

  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadDealsData();
    
    // Set up real-time updates (mock WebSocket)
    const wsInterval = setInterval(() => {
      refreshDealsData();
    }, 30000);

    return () => clearInterval(wsInterval);
  }, []);

  useEffect(() => {
    // DD-03: Read tab param from URL
    const tabParam = searchParams.get('tab');
    if (tabParam && STATUS_TABS.some(t => t.id === tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [searchParams]);

  const loadDealsData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const dealerProfile = await Dealer.filter({ created_by: user.email });
      if (dealerProfile.length > 0) {
        setCurrentDealer(dealerProfile[0]);
        await loadTransactions(dealerProfile[0]);
      }
    } catch (error) {
      console.error("Error loading deals data:", error);
    }
    setIsLoading(false);
  };

  const loadTransactions = async (dealer) => {
    try {
      // Load transactions where user is buyer OR seller - using separate queries instead of $or
      const [buyerTransactions, sellerTransactions] = await Promise.all([
        Transaction.filter({ buyer_id: dealer.id }),
        Transaction.filter({ seller_id: dealer.id })
      ]);

      const allTransactions = [
        ...buyerTransactions.map(t => ({ ...t, user_role: 'buyer' })),
        ...sellerTransactions.map(t => ({ ...t, user_role: 'seller' }))
      ];

      // Remove duplicates (shouldn't happen but safety)
      const uniqueTransactions = allTransactions.filter(
        (t, index, self) => index === self.findIndex(tx => tx.id === t.id)
      );

      const nonArchived = uniqueTransactions.filter(t => t.status !== 'archived');
      setTransactions(nonArchived);

      // Load related vehicle and dealer data safely
      const vehicleIds = [...new Set(uniqueTransactions.map((t: any) => t.vehicle_id))].filter(Boolean);
      const dealerIds = [...new Set([
        ...uniqueTransactions.map((t: any) => t.buyer_id),
        ...uniqueTransactions.map((t: any) => t.seller_id)
      ])].filter(Boolean);

      // Load vehicles and dealers with error handling
      const vehiclePromises = vehicleIds.map(async (id) => {
        try {
          const vehicle = await Vehicle.get(id);
          return vehicle;
        } catch (error) {
          console.error(`Error loading vehicle ${id}:`, error);
          return null;
        }
      });

      const dealerPromises = dealerIds.map(async (id) => {
        try {
          const dealer = await Dealer.get(id);
          return dealer;
        } catch (error) {
          console.error(`Error loading dealer ${id}:`, error);
          return null;
        }
      });

      const [vehicleData, dealerData] = await Promise.all([
        Promise.all(vehiclePromises),
        Promise.all(dealerPromises)
      ]);

      // Create lookup objects, filtering out null values
      const vehicleLookup = {};
      vehicleData.forEach(v => { 
        if (v) vehicleLookup[v.id] = v; 
      });
      
      const dealerLookup = {};
      dealerData.forEach(d => { 
        if (d) dealerLookup[d.id] = d; 
      });

      setVehicles(vehicleLookup);
      setDealers(dealerLookup);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const refreshDealsData = async () => {
    if (currentDealer) {
      await loadTransactions(currentDealer);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Filter by tab
    if (selectedTab !== "all") {
      const tabConfig = STATUS_TABS.find(t => t.id === selectedTab);
      if (tabConfig && tabConfig.statuses.length > 0) {
        filtered = filtered.filter(t => tabConfig.statuses.includes(t.status));
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((transaction: any) => {
        const vehicle = vehicles[transaction.vehicle_id];
        const counterParty = transaction.user_role === 'buyer' 
          ? dealers[transaction.seller_id]
          : dealers[transaction.buyer_id];
        
        return (
          vehicle?.registration_number?.toLowerCase().includes(query) ||
          (vehicle && `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(query)) ||
          counterParty?.business_name?.toLowerCase().includes(query) ||
          String(transaction.id).toLowerCase().includes(query)
        );
      });
    }

    // Role filter
    if (filters.role !== "all") {
      filtered = filtered.filter(t => t.user_role === filters.role);
    }

    return filtered;
  };

  const getStatusCounts = () => {
    const counts = {};
    STATUS_TABS.forEach(tab => {
      if (tab.id === "all") {
        counts[tab.id] = transactions.length;
      } else {
        counts[tab.id] = transactions.filter(t => 
          tab.statuses.includes(t.status)
        ).length;
      }
    });
    return counts;
  };

  const handleBulkArchive = async () => {
    try {
      const updates = Array.from(selectedDeals).map(dealId => 
        Transaction.update(dealId as string, { status: 'archived' })
      );
      await Promise.all(updates);
      setSelectedDeals(new Set());
      refreshDealsData();
    } catch (error) {
      console.error("Error archiving deals:", error);
    }
  };

  const handleExportPDF = () => {
    console.log("Exporting selected deals to PDF:", Array.from(selectedDeals));
    // Mock PDF export
  };

  const filteredTransactions = getFilteredTransactions();
  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Deals</h1>
            <p className="text-slate-600 mt-1">
              Track and manage all your transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={refreshDealsData}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Link to={createPageUrl("Marketplace")}>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Search className="w-4 h-4" />
                Find Vehicles
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by registration, dealer name, transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
            
            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <DealsFilters 
                  filters={filters}
                  setFilters={setFilters}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-7">
            {STATUS_TABS.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="relative">
                {tab.label}
                {statusCounts[tab.id] > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-blue-100 text-blue-700 text-xs"
                  >
                    {statusCounts[tab.id]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {STATUS_TABS.map(tab => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="space-y-4">
                {/* Bulk Actions */}
                {selectedDeals.size > 0 && (
                  <BulkActionBar
                    selectedCount={selectedDeals.size}
                    onArchive={handleBulkArchive}
                    onExport={handleExportPDF}
                    onClear={() => setSelectedDeals(new Set())}
                  />
                )}

                {/* Deals List */}
                {filteredTransactions.length === 0 ? (
                  <EmptyDealsState 
                    activeTab={selectedTab}
                    hasSearch={searchQuery.length > 0}
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map(transaction => (
                      <DealRow
                        key={transaction.id}
                        transaction={transaction}
                        vehicle={vehicles[transaction.vehicle_id]}
                        counterParty={transaction.user_role === 'buyer' 
                          ? dealers[transaction.seller_id]
                          : dealers[transaction.buyer_id]
                        }
                        userRole={transaction.user_role}
                        isSelected={selectedDeals.has(transaction.id)}
                        onSelect={(selected) => {
                          const newSelection = new Set(selectedDeals);
                          if (selected) {
                            newSelection.add(transaction.id);
                          } else {
                            newSelection.delete(transaction.id);
                          }
                          setSelectedDeals(newSelection);
                        }}
                        statusColors={STATUS_COLORS}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
