import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import {
  FileText,
  Download,
  Plus,
  Settings,
  Calendar,
  BarChart2,
  PieChart,
  LineChart,
  Trash2,
  Edit,
  Copy,
  Share2,
  Filter
} from 'lucide-react';

interface CustomReportsProps {
  selectedBranchId: string;
  dealerId: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[];
  filters: any[];
  chartType: string;
  schedule?: 'daily' | 'weekly' | 'monthly';
  lastRun?: string;
  createdAt: string;
}

interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  category: string;
}

const AVAILABLE_FIELDS: ReportField[] = [
  // Vehicle Information
  { id: 'make', name: 'Make', label: 'Vehicle Make', type: 'text', category: 'Vehicle' },
  { id: 'model', name: 'Model', label: 'Vehicle Model', type: 'text', category: 'Vehicle' },
  { id: 'year', name: 'Year', label: 'Manufacturing Year', type: 'number', category: 'Vehicle' },
  { id: 'price', name: 'Price', label: 'Selling Price', type: 'number', category: 'Vehicle' },
  { id: 'cost', name: 'Cost', label: 'Purchase Cost', type: 'number', category: 'Vehicle' },
  { id: 'profit', name: 'Profit', label: 'Profit Margin', type: 'number', category: 'Vehicle' },

  // Deal Information
  { id: 'deal_date', name: 'Deal Date', label: 'Transaction Date', type: 'date', category: 'Deal' },
  { id: 'deal_status', name: 'Deal Status', label: 'Current Status', type: 'text', category: 'Deal' },
  { id: 'lead_source', name: 'Lead Source', label: 'How they found us', type: 'text', category: 'Deal' },
  { id: 'salesperson', name: 'Salesperson', label: 'Sales Representative', type: 'text', category: 'Deal' },

  // Customer Information
  { id: 'customer_name', name: 'Customer Name', label: 'Buyer Name', type: 'text', category: 'Customer' },
  { id: 'customer_phone', name: 'Customer Phone', label: 'Contact Number', type: 'text', category: 'Customer' },
  { id: 'customer_location', name: 'Customer Location', label: 'Customer City', type: 'text', category: 'Customer' },

  // Performance Metrics
  { id: 'days_in_stock', name: 'Days in Stock', label: 'Time to Sell', type: 'number', category: 'Performance' },
  { id: 'conversion_rate', name: 'Conversion Rate', label: 'Lead to Sale %', type: 'number', category: 'Performance' },
  { id: 'avg_deal_value', name: 'Avg Deal Value', label: 'Average Transaction', type: 'number', category: 'Performance' }
];

const REPORT_CATEGORIES = [
  'Sales Performance',
  'Inventory Analysis',
  'Customer Insights',
  'Financial Reports',
  'Operational Metrics'
];

export default function CustomReports({ selectedBranchId, dealerId }: CustomReportsProps) {
  const [reports, setReports] = useState<ReportTemplate[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportTemplate | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    category: '',
    chartType: 'table',
    schedule: '' as '' | 'daily' | 'weekly' | 'monthly'
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Mock existing reports
      const mockReports: ReportTemplate[] = [
        {
          id: '1',
          name: 'Monthly Sales Performance',
          description: 'Comprehensive sales metrics for the current month',
          category: 'Sales Performance',
          fields: ['make', 'model', 'price', 'deal_date', 'customer_name'],
          filters: [],
          chartType: 'bar',
          schedule: 'monthly',
          lastRun: '2024-01-15',
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Inventory Turnover Report',
          description: 'Track how quickly vehicles are selling',
          category: 'Inventory Analysis',
          fields: ['make', 'model', 'days_in_stock', 'price', 'deal_status'],
          filters: [],
          chartType: 'line',
          schedule: 'weekly',
          lastRun: '2024-01-12',
          createdAt: '2024-01-05'
        },
        {
          id: '3',
          name: 'Customer Acquisition Analysis',
          description: 'Analyze customer sources and conversion rates',
          category: 'Customer Insights',
          fields: ['lead_source', 'customer_name', 'conversion_rate', 'deal_date'],
          filters: [],
          chartType: 'pie',
          schedule: 'weekly',
          lastRun: '2024-01-12',
          createdAt: '2024-01-08'
        }
      ];

      setReports(mockReports);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!newReport.name || !newReport.category || selectedFields.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one field",
        variant: "destructive",
      });
      return;
    }

    try {
      const report: ReportTemplate = {
        id: Date.now().toString(),
        name: newReport.name,
        description: newReport.description,
        category: newReport.category,
        fields: selectedFields,
        filters: [],
        chartType: newReport.chartType,
        schedule: newReport.schedule || undefined,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setReports(prev => [...prev, report]);
      setNewReport({
        name: '',
        description: '',
        category: '',
        chartType: 'table',
        schedule: ''
      });
      setSelectedFields([]);
      setShowCreateDialog(false);

      toast({
        title: "Report Created",
        description: `${report.name} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive",
      });
    }
  };

  const handleEditReport = (report: ReportTemplate) => {
    setEditingReport(report);
    setNewReport({
      name: report.name,
      description: report.description,
      category: report.category,
      chartType: report.chartType,
      schedule: report.schedule || ''
    });
    setSelectedFields(report.fields);
    setShowCreateDialog(true);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast({
      title: "Report Deleted",
      description: "Report has been deleted successfully",
    });
  };

  const handleRunReport = (report: ReportTemplate) => {
    toast({
      title: "Report Generated",
      description: `Running ${report.name}...`,
    });

    // Update last run timestamp
    setReports(prev => prev.map(r =>
      r.id === report.id
        ? { ...r, lastRun: new Date().toISOString().split('T')[0] }
        : r
    ));
  };

  const handleExportReport = (report: ReportTemplate, format: 'csv' | 'pdf' | 'excel') => {
    toast({
      title: "Export Started",
      description: `Exporting ${report.name} as ${format.toUpperCase()}...`,
    });
  };

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'bar': return <BarChart2 className="w-4 h-4" />;
      case 'line': return <LineChart className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const groupedFields = AVAILABLE_FIELDS.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ReportField[]>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Custom Reports
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Create, manage, and export custom analytics reports
          </p>
        </div>

        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getChartIcon(report.chartType)}
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditReport(report)}
                    className="w-8 h-8"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteReport(report.id)}
                    className="w-8 h-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {report.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{report.category}</Badge>
                {report.schedule && (
                  <Badge variant="secondary">{report.schedule}</Badge>
                )}
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p>{report.fields.length} fields selected</p>
                {report.lastRun && (
                  <p>Last run: {new Date(report.lastRun).toLocaleDateString()}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleRunReport(report)}
                  className="flex-1"
                >
                  Run Report
                </Button>
                <Select onValueChange={(value) => handleExportReport(report, value as any)}>
                  <SelectTrigger className="w-24">
                    <Download className="w-3 h-3" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Report Card */}
        <Card
          className="border-dashed border-2 hover:border-blue-500 cursor-pointer transition-colors"
          onClick={() => setShowCreateDialog(true)}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Plus className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-center">
              Create New Report
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Report Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={() => {
        setShowCreateDialog(false);
        setEditingReport(null);
        setNewReport({
          name: '',
          description: '',
          category: '',
          chartType: 'table',
          schedule: ''
        });
        setSelectedFields([]);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? 'Edit Report' : 'Create Custom Report'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report_name">Report Name *</Label>
                <Input
                  id="report_name"
                  value={newReport.name}
                  onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name"
                />
              </div>

              <div>
                <Label htmlFor="report_category">Category *</Label>
                <Select
                  value={newReport.category}
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="report_description">Description</Label>
              <Textarea
                id="report_description"
                value={newReport.description}
                onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this report will show..."
                rows={2}
              />
            </div>

            {/* Chart Type */}
            <div>
              <Label>Visualization Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {[
                  { value: 'table', label: 'Table', icon: FileText },
                  { value: 'bar', label: 'Bar Chart', icon: BarChart2 },
                  { value: 'line', label: 'Line Chart', icon: LineChart },
                  { value: 'pie', label: 'Pie Chart', icon: PieChart }
                ].map(({ value, label, icon: Icon }) => (
                  <div
                    key={value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      newReport.chartType === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    onClick={() => setNewReport(prev => ({ ...prev, chartType: value }))}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Selection */}
            <div>
              <Label>Select Fields to Include</Label>
              <div className="mt-3 space-y-4 max-h-64 overflow-y-auto">
                {Object.entries(groupedFields).map(([category, fields]) => (
                  <div key={category}>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                      {fields.map((field) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={field.id}
                            checked={selectedFields.includes(field.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFields(prev => [...prev, field.id]);
                              } else {
                                setSelectedFields(prev => prev.filter(id => id !== field.id));
                              }
                            }}
                          />
                          <Label htmlFor={field.id} className="text-sm cursor-pointer">
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {selectedFields.length} fields selected
              </p>
            </div>

            {/* Schedule */}
            <div>
              <Label>Schedule (Optional)</Label>
              <Select
                value={newReport.schedule}
                onValueChange={(value) => setNewReport(prev => ({ ...prev, schedule: value as any }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Schedule</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Reports will be automatically generated and emailed
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingReport(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateReport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingReport ? 'Update Report' : 'Create Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
