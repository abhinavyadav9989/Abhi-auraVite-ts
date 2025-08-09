import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Database, Settings, AlertTriangle } from 'lucide-react';
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
                <p className="text-slate-600">
                  Tools for migrating vehicle media to VehicleAsset entities.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}