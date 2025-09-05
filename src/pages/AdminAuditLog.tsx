import React, { useState, useEffect } from 'react';
import { AuditLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const jsonToCsv = (items) => {
  const replacer = (key, value) => value === null ? '' : value;
  const header = Object.keys(items[0]);
  const csv = [
    header.join(','),
    ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');
  return csv;
};

const downloadBlob = (blob, name) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const auditLogs = await AuditLog.list();
        const latest = (auditLogs as any[]).sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()).slice(0, 50);
        setLogs(latest);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      }
      setIsLoading(false);
    };
    fetchLogs();
  }, []);
  
  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const simplifiedLogs = logs.map(log => ({
      timestamp: log.created_date,
      actor: log.actor_email,
      action: log.action,
      target_type: log.target_type,
      target_id: log.target_id,
      details: log.details,
      changes: JSON.stringify(log.changes)
    }));
    const csvData = jsonToCsv(simplifiedLogs);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `aura-audit-log-${new Date().toISOString()}.csv`);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-100 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Platform Audit Log</h1>
          <Button onClick={handleExportCsv} disabled={logs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.created_date), 'PPpp')}</TableCell>
                    <TableCell>{log.actor_email}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.target_type}: {log.target_id}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {logs.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 p-8">No audit logs found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}