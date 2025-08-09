
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import InfoTooltip from '@/components/ui/InfoTooltip';

export default function SystemHealthPanel({
  systemHealth = { webhooks: [], cronJobs: [] },
  onRetryWebhook,
  onMaintenanceToggle,
  isMaintenanceMode
}: any) {
  const { toast } = useToast();

  const handleRetryWebhook = async (webhookId) => {
    try {
      await onRetryWebhook?.(webhookId);
      toast({
        title: "Webhook Retried",
        description: "The webhook has been queued for retry.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry webhook.",
        variant: "destructive"
      });
    }
  };

  const failedWebhooks = systemHealth.webhooks.filter(wh => wh.status === 'failed');
  const errorCrons = systemHealth.cronJobs.filter(cron => cron.status === 'error');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Webhook Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Webhook Health
            <InfoTooltip>
              Webhooks are automated notifications sent to external services (payment gateways, logistics partners, etc.). Failed webhooks indicate integration issues that may affect transaction processing.
            </InfoTooltip>
          </CardTitle>
          <Badge variant={failedWebhooks.length > 0 ? "destructive" : "secondary"}>
            {failedWebhooks.length} failed
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemHealth.webhooks.length === 0 ? (
              <p className="text-sm text-slate-500">No recent webhook activity</p>
            ) : (
              systemHealth.webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    webhook.status === 'failed' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {webhook.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-medium text-sm">{webhook.service}</span>
                    </div>
                    <p className="text-xs text-slate-600">{webhook.event}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(webhook.timestamp), 'MMM d, HH:mm')}
                    </p>
                  </div>
                  {webhook.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetryWebhook(webhook.id)}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cron Job Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Scheduled Jobs
            <InfoTooltip>
              Automated background tasks that run on schedule (daily reports, inventory updates, market data sync). Failed jobs can cause data inconsistencies or missing functionality.
            </InfoTooltip>
          </CardTitle>
          <Badge variant={errorCrons.length > 0 ? "destructive" : "secondary"}>
            {errorCrons.length} issues
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemHealth.cronJobs.map((job) => (
              <div
                key={job.name}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  job.status === 'error' ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {job.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    <span className="font-medium text-sm">{job.name.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                    <span>Last run: {format(new Date(job.lastRun), 'MMM d, HH:mm')}</span>
                    <span>Latency: {job.latency}ms</span>
                  </div>
                </div>
                <Badge variant={job.status === 'error' ? "destructive" : "secondary"}>
                  {job.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Platform Controls
            <InfoTooltip>
              Maintenance mode temporarily disables platform access for all dealers while critical updates or fixes are applied. Use only during emergencies or planned maintenance windows.
            </InfoTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Maintenance Mode</AlertTitle>
            <AlertDescription>
              Activating this will make the platform temporarily unavailable to all dealers. Use with caution.
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-between mt-4 p-3 border rounded-lg">
            <Label htmlFor="maintenance-mode" className="font-medium">
              Enable Maintenance Mode
            </Label>
            <Switch
              id="maintenance-mode"
              checked={isMaintenanceMode}
              onCheckedChange={onMaintenanceToggle}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
