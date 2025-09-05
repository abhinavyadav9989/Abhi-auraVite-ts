import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Search, 
  Clock, 
  FileText, 
  CheckCircle,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DISPUTE_COLUMNS = [
  { id: 'new', title: 'New', icon: AlertTriangle, color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700/50' },
  { id: 'investigating', title: 'Investigating', icon: Search, color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700/50' },
  { id: 'awaiting_evidence', title: 'Awaiting Evidence', icon: Clock, color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50' },
  { id: 'resolved', title: 'Resolved', icon: CheckCircle, color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/50' }
];

const POLICY_CODES = [
  { value: 'POL-001', label: 'Vehicle Condition Misrepresentation' },
  { value: 'POL-002', label: 'Documentation Issues' },
  { value: 'POL-003', label: 'Payment Disputes' },
  { value: 'POL-004', label: 'Delivery Problems' },
  { value: 'POL-005', label: 'Fraudulent Activity' }
];

type Dispute = {
  id: string | number;
  vehicle?: string;
  reason?: string;
};

type DisputesBoard = {
  new: Dispute[];
  investigating: Dispute[];
  awaiting_evidence: Dispute[];
  resolved: Dispute[];
};

type Props = {
  disputes?: Partial<DisputesBoard>;
  onStatusChange?: (disputeId: string | number, newStatus: string) => Promise<void> | void;
  onRefund?: (disputeId: string | number, refundPercentage: number) => Promise<void> | void;
  onAddNote?: (disputeId: string | number, payload: { note: string; policyCode: string }) => Promise<void> | void;
};

export default function DisputesKanbanWidget({ 
  disputes = {
    new: [],
    investigating: [],
    awaiting_evidence: [],
    resolved: []
  }, 
  onStatusChange, 
  onRefund, 
  onAddNote 
}: Props) {
  const { toast } = useToast();
  const [selectedDispute, setSelectedDispute] = React.useState<Dispute | null>(null);
  const [refundPercentage, setRefundPercentage] = React.useState(100);
  const [resolutionNote, setResolutionNote] = React.useState('');
  const [selectedPolicyCode, setSelectedPolicyCode] = React.useState('');

  // Ensure disputes object has all required properties
  const safeDisputes = {
    new: disputes?.new || [],
    investigating: disputes?.investigating || [],
    awaiting_evidence: disputes?.awaiting_evidence || [],
    resolved: disputes?.resolved || []
  };

  const handleStatusChange = async (disputeId: string | number, newStatus: string) => {
    try {
      await onStatusChange?.(disputeId, newStatus);
      toast({
        title: "Status Updated",
        description: `Dispute moved to ${newStatus.replace('_', ' ')}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update dispute status.",
        variant: "destructive"
      });
    }
  };

  const handleRefund = async (disputeId: string | number) => {
    try {
      await onRefund?.(disputeId, refundPercentage);
      toast({
        title: "Refund Processed",
        description: `${refundPercentage}% refund initiated for dispute ${disputeId}.`,
      });
      setSelectedDispute(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process refund.",
        variant: "destructive"
      });
    }
  };

  const DisputeCard = ({ dispute }: { dispute: Dispute }) => (
    <div 
      className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedDispute(dispute)}
    >
      <div className="font-medium text-sm mb-1">{dispute.id || 'Unknown ID'}</div>
      <div className="text-xs text-slate-600 mb-2">{dispute.vehicle || 'Unknown Vehicle'}</div>
      <div className="text-xs text-slate-500">{dispute.reason || 'No reason provided'}</div>
      <div className="flex justify-between items-center mt-2">
        <Badge variant="outline" className="text-xs">
          Priority: High
        </Badge>
        <span className="text-xs text-slate-400">2h ago</span>
      </div>
    </div>
  );

  return (
    <>
      <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Disputes Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {DISPUTE_COLUMNS.map((column) => {
              const Icon = column.icon;
              const columnDisputes = safeDisputes[column.id] || [];
              
              return (
                <div key={column.id} className={`p-3 rounded-lg border-2 border-dashed ${column.color}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" />
                    <h3 className="font-medium text-sm dark:text-white">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnDisputes.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {columnDisputes.map((dispute, index) => (
                      <DisputeCard key={dispute?.id || index} dispute={dispute} />
                    ))}
                    {columnDisputes.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-xs">
                        No disputes
                      </div>
                    )}
                    {/* Drop zone for drag & drop (simplified) */}
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded p-2 text-center text-xs text-slate-400 dark:text-slate-300 min-h-[40px] flex items-center justify-center">
                      Drop here
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Dispute {selectedDispute.id || 'Unknown'}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDispute(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Vehicle</label>
                <p className="text-sm text-slate-600">{selectedDispute.vehicle || 'Unknown'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Reason</label>
                <p className="text-sm text-slate-600">{selectedDispute.reason || 'No reason provided'}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status Actions</label>
                <div className="flex gap-2">
                  {DISPUTE_COLUMNS.map((status) => (
                    <Button
                      key={status.id}
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedDispute.id, status.id)}
                    >
                      {status.title}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Process Refund</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Refund:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={refundPercentage}
                      onChange={(e) => setRefundPercentage(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">{refundPercentage}%</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRefund(selectedDispute.id)}
                    className="w-full"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Process Refund
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Policy Reference</label>
                <Select value={selectedPolicyCode} onValueChange={setSelectedPolicyCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy code" />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_CODES.map((policy) => (
                      <SelectItem key={policy.value} value={policy.value}>
                        {policy.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Resolution Notes</label>
                <Textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Add notes about the resolution..."
                  rows={3}
                />
              </div>

              <Button
                onClick={() => {
                  onAddNote?.(selectedDispute.id, {
                    note: resolutionNote,
                    policyCode: selectedPolicyCode
                  });
                  setSelectedDispute(null);
                }}
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}