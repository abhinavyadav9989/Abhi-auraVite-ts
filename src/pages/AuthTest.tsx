import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AuthTest() {
  const { user, loading, error, isAuthenticated, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email Verified:</strong> {user.email_confirmed_at ? "Yes" : "No"}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
              
              <Button 
                onClick={signOut} 
                className="w-full"
                variant="outline"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>No user logged in</p>
              <p className="text-sm mt-2">
                You should be redirected to the Authentication page
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
