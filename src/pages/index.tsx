import Layout from "./Layout";

import Dashboard from "./Dashboard";

import Inventory from "./Inventory";

import Marketplace from "./Marketplace";

import Profile from "./Profile";

import AddVehicle from "./AddVehicle";

import VehicleDetail from "./VehicleDetail";

import Deals from "./Deals";

import DealRoom from "./DealRoom";

import AdminPanel from "./AdminPanel";

import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";

import DisputeResolution from "./DisputeResolution";

import InventoryAnalytics from "./InventoryAnalytics";

import MarketTrends from "./MarketTrends";

import PublicVehicleView from "./PublicVehicleView";

import AdminAuditLog from "./AdminAuditLog";

import LogisticsTracker from "./LogisticsTracker";

import EditVehicle from "./EditVehicle";

import Settings from "./Settings";

import Compare from "./Compare";

import EmailVerification from "./EmailVerification";

import OnboardingPath from "./OnboardingPath";

import KYBWizard from "./KYBWizard";

import AdminKYBVerification from "./AdminKYBVerification";

import ProvisionalExtensions from "./ProvisionalExtensions";

import TaskBoard from "./TaskBoard";

import BulkImport from "./BulkImport";

import Shortlists from "./Shortlists";

import VehicleView from "./VehicleView";

import OnboardingWizard from "./OnboardingWizard";

import DataMigrationPanel from "./DataMigrationPanel";

import Authentication from "./Authentication";

import { Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Inventory: Inventory,
    
    Marketplace: Marketplace,
    
    Profile: Profile,
    
    AddVehicle: AddVehicle,
    
    VehicleDetail: VehicleDetail,
    
    Deals: Deals,
    
    DealRoom: DealRoom,
    
    AdminPanel: AdminPanel,
    
    AdminDashboard: AdminDashboard,
    AdminUsers: AdminUsers,
    
    DisputeResolution: DisputeResolution,
    
    InventoryAnalytics: InventoryAnalytics,
    
    MarketTrends: MarketTrends,
    
    PublicVehicleView: PublicVehicleView,
    
    AdminAuditLog: AdminAuditLog,
    
    LogisticsTracker: LogisticsTracker,
    
    EditVehicle: EditVehicle,
    
    Settings: Settings,
    
    Compare: Compare,
    
    EmailVerification: EmailVerification,
    
    OnboardingPath: OnboardingPath,
    
    KYBWizard: KYBWizard,
    
    AdminKYBVerification: AdminKYBVerification,
    
    ProvisionalExtensions: ProvisionalExtensions,
    
    TaskBoard: TaskBoard,
    
    BulkImport: BulkImport,
    
    Shortlists: Shortlists,
    
    VehicleView: VehicleView,
    
    OnboardingWizard: OnboardingWizard,
    
    DataMigrationPanel: DataMigrationPanel,
    
    Authentication: Authentication,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Inventory" element={<Inventory />} />
                
                <Route path="/Marketplace" element={<Marketplace />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/AddVehicle" element={<AddVehicle />} />
                
                <Route path="/VehicleDetail" element={<VehicleDetail />} />
                
                <Route path="/Deals" element={<Deals />} />
                
                <Route path="/DealRoom" element={<DealRoom />} />
                
                <Route path="/AdminPanel" element={<AdminPanel />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/AdminUsers" element={<AdminUsers />} />
                
                <Route path="/DisputeResolution" element={<DisputeResolution />} />
                
                <Route path="/InventoryAnalytics" element={<InventoryAnalytics />} />
                
                <Route path="/MarketTrends" element={<MarketTrends />} />
                
                <Route path="/PublicVehicleView" element={<PublicVehicleView />} />
                
                <Route path="/AdminAuditLog" element={<AdminAuditLog />} />
                
                <Route path="/LogisticsTracker" element={<LogisticsTracker />} />
                
                <Route path="/EditVehicle" element={<EditVehicle />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Compare" element={<Compare />} />
                
                <Route path="/EmailVerification" element={<EmailVerification />} />
                
                <Route path="/OnboardingPath" element={<OnboardingPath />} />
                
                <Route path="/KYBWizard" element={<KYBWizard />} />
                
                <Route path="/AdminKYBVerification" element={<AdminKYBVerification />} />
                
                <Route path="/ProvisionalExtensions" element={<ProvisionalExtensions />} />
                
                <Route path="/TaskBoard" element={<TaskBoard />} />
                
                <Route path="/BulkImport" element={<BulkImport />} />
                
                <Route path="/Shortlists" element={<Shortlists />} />
                
                <Route path="/VehicleView" element={<VehicleView />} />
                
                <Route path="/OnboardingWizard" element={<OnboardingWizard />} />
                
                <Route path="/DataMigrationPanel" element={<DataMigrationPanel />} />
                
                <Route path="/Authentication" element={<Authentication />} />
                
                {/* Catch-all route - redirect to Authentication */}
                <Route path="*" element={<Authentication />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return <PagesContent />;
}