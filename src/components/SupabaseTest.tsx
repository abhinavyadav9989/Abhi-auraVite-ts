import { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test basic connection
      const { data, error } = await supabase.from('dealers').select('count');
      
      if (error) {
        setTestResult(`❌ Error: ${error.message}`);
      } else {
        setTestResult(`✅ Connection successful! Found ${data?.length || 0} records`);
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setTestResult(`❌ Auth Error: ${error.message}`);
      } else {
        setTestResult(`✅ Auth working! User: ${user ? user.email : 'Not logged in'}`);
      }
    } catch (err) {
      setTestResult(`❌ Auth Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={loading}>
            Test Database
          </Button>
          <Button onClick={testAuth} disabled={loading} variant="outline">
            Test Auth
          </Button>
        </div>
        
        {testResult && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            {testResult}
          </div>
        )}
        
        {loading && (
          <div className="text-center text-gray-500">
            Testing connection...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
