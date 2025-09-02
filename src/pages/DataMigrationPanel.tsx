import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Database, Settings, AlertTriangle } from 'lucide-react';
import { Vehicle, Dealer, DealerDocument, VehicleAsset } from '@/api/entities';
import PermissionGuard from '@/components/security/PermissionGuard';
import { usePermissions } from '@/components/security/PermissionGuard';

export default function DataMigrationPanel() {
  const { hasPermission, isLoading } = usePermissions();
  
  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }
  
  if (!hasPermission('admin.access')) {
    return (
      <PermissionGuard permission="admin.access" showMessage={true}>
        <div />
      </PermissionGuard>
    );
  }
  
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Data Migration Panel
            </h1>
            <p className="text-slate-600 mt-1">
              Administrative tools for data consistency and migration
            </p>
          </div>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> These tools modify data directly. Always backup data before running migrations.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Vehicle Categories
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Status Validation
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Media Migration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Category Migration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Tools for migrating vehicle categories from string to array format.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Status Validation Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Tools for validating entity status transitions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media Migration Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Fix broken blob: URLs and ensure permanent storage links.</p>
                <div className="space-y-3">
                  <button
                    className="px-3 py-2 rounded bg-blue-600 text-white"
                    onClick={async () => {
                      // Clean vehicles.images and hero_image_url
                      const vehicles = await Vehicle.filter({});
                      for (const v of vehicles) {
                        let updated: any = {};
                        if (Array.isArray(v.images)) {
                          const cleaned = v.images.filter((u: string) => typeof u === 'string' && !u.startsWith('blob:'));
                          if (cleaned.length !== v.images.length) updated.images = cleaned;
                        }
                        if (typeof v.hero_image_url === 'string' && v.hero_image_url.startsWith('blob:')) {
                          updated.hero_image_url = null;
                        }
                        if (Object.keys(updated).length > 0) await Vehicle.update(v.id, updated);
                      }

                      // Clean dealer logos/banners
                      const dealers = await Dealer.filter({});
                      for (const d of dealers) {
                        const upd: any = {};
                        if (d.logo_url?.startsWith?.('blob:')) upd.logo_url = null;
                        if (d.banner_url?.startsWith?.('blob:')) upd.banner_url = null;
                        if (Object.keys(upd).length > 0) await Dealer.update(d.id, upd);
                      }

                      // Clean dealer_documents
                      const docs = await DealerDocument.filter({});
                      for (const doc of docs) {
                        if (doc.file_url?.startsWith?.('blob:')) {
                          await DealerDocument.update(doc.id, { file_url: null, status: 'pending' });
                        }
                      }

                      // Clean vehicle_assets
                      const assets = await VehicleAsset.filter({});
                      for (const a of assets) {
                        if (a.file_url?.startsWith?.('blob:')) {
                          await VehicleAsset.update(a.id, { file_url: null, status: 'pending' });
                        }
                      }
                      alert('Blob URL cleanup completed. Some items may need re-upload.');
                    }}
                  >
                    Run Blob URL Cleanup
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}