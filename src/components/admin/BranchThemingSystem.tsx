import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Palette,
  Upload,
  Save,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Droplet,
  Settings,
  Building,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Download
} from 'lucide-react';
import {
  BranchTheme as BranchThemeType,
  BranchTheme as BranchThemeEntity
} from '@/api/entityAdapters';

interface BranchThemingSystemProps {
  dealerId: string;
}

const PRESET_COLORS = [
  { name: 'Blue', primary: '#2563eb', secondary: '#1d4ed8', accent: '#3b82f6' },
  { name: 'Green', primary: '#059669', secondary: '#047857', accent: '#10b981' },
  { name: 'Purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' },
  { name: 'Red', primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' },
  { name: 'Orange', primary: '#ea580c', secondary: '#c2410c', accent: '#f97316' },
  { name: 'Teal', primary: '#0d9488', secondary: '#0f766e', accent: '#14b8a6' },
  { name: 'Indigo', primary: '#4338ca', secondary: '#3730a3', accent: '#6366f1' },
  { name: 'Pink', primary: '#db2777', secondary: '#be185d', accent: '#ec4899' }
];

const BORDER_RADIUS_OPTIONS = [
  { value: 'none', label: 'Sharp', preview: 'rounded-none' },
  { value: 'small', label: 'Small', preview: 'rounded-sm' },
  { value: 'medium', label: 'Medium', preview: 'rounded-md' },
  { value: 'large', label: 'Large', preview: 'rounded-lg' }
];

const BUTTON_STYLES = [
  { value: 'rounded', label: 'Rounded', preview: 'rounded-md' },
  { value: 'square', label: 'Square', preview: 'rounded-none' },
  { value: 'pill', label: 'Pill', preview: 'rounded-full' }
];

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Lato', label: 'Lato (Elegant)' },
  { value: 'Poppins', label: 'Poppins (Bold)' },
  { value: 'Nunito', label: 'Nunito (Rounded)' }
];

export default function BranchThemingSystem({ dealerId }: BranchThemingSystemProps) {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [currentTheme, setCurrentTheme] = useState<BranchThemeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Theme form state
  const [themeForm, setThemeForm] = useState({
    primaryColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    accentColor: '#3b82f6',
    logoUrl: '',
    bannerUrl: '',
    fontFamily: 'Inter',
    borderRadius: 'medium' as BranchThemeType['borderRadius'],
    buttonStyle: 'rounded' as BranchThemeType['buttonStyle'],
    customCss: ''
  });

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      loadBranchTheme(selectedBranch.id);
    }
  }, [selectedBranch]);

  const loadBranches = async () => {
    try {
      // This would come from the BranchHierarchy entity
      // For now, using mock data
      const mockBranches = [
        { id: '1', name: 'Downtown Showroom', type: 'showroom', city: 'Mumbai' },
        { id: '2', name: 'North Service Center', type: 'workshop', city: 'Delhi' },
        { id: '3', name: 'South Outlet', type: 'outlet', city: 'Chennai' }
      ];
      setBranches(mockBranches);
      setSelectedBranch(mockBranches[0]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranchTheme = async (branchId: string) => {
    try {
      const { data, error } = await BranchThemeEntity.get(branchId);

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setCurrentTheme(data);
        setThemeForm({
          primaryColor: data.primary_color || '#2563eb',
          secondaryColor: data.secondary_color || '#1d4ed8',
          accentColor: data.accent_color || '#3b82f6',
          logoUrl: data.logo_url || '',
          bannerUrl: data.banner_url || '',
          fontFamily: data.font_family || 'Inter',
          borderRadius: data.border_radius || 'medium',
          buttonStyle: data.button_style || 'rounded',
          customCss: data.custom_css || ''
        });
      } else {
        // Use default theme
        setCurrentTheme(null);
        setThemeForm({
          primaryColor: '#2563eb',
          secondaryColor: '#1d4ed8',
          accentColor: '#3b82f6',
          logoUrl: '',
          bannerUrl: '',
          fontFamily: 'Inter',
          borderRadius: 'medium',
          buttonStyle: 'rounded',
          customCss: ''
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load theme",
        variant: "destructive",
      });
    }
  };

  const handleSaveTheme = async () => {
    if (!selectedBranch) return;

    try {
      const themeData = {
        primary_color: themeForm.primaryColor,
        secondary_color: themeForm.secondaryColor,
        accent_color: themeForm.accentColor,
        logo_url: themeForm.logoUrl,
        banner_url: themeForm.bannerUrl,
        font_family: themeForm.fontFamily,
        border_radius: themeForm.borderRadius,
        button_style: themeForm.buttonStyle,
        custom_css: themeForm.customCss
      };

      const { data, error } = await BranchThemeEntity.applyTheme(selectedBranch.id, themeData);
      if (error) throw error;

      setCurrentTheme(data);
      toast({
        title: "Theme Saved",
        description: `${selectedBranch.name} theme has been updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme",
        variant: "destructive",
      });
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_COLORS[0]) => {
    setThemeForm(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    }));
  };

  const handleResetTheme = () => {
    setThemeForm({
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      accentColor: '#3b82f6',
      logoUrl: '',
      bannerUrl: '',
      fontFamily: 'Inter',
      borderRadius: 'medium',
      buttonStyle: 'rounded',
      customCss: ''
    });
  };

  const handleExportTheme = () => {
    const themeData = {
      branchId: selectedBranch?.id,
      theme: themeForm,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(themeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${selectedBranch?.name || 'branch'}_theme.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Theme Preview Component
  const ThemePreview = () => (
    <div
      className="space-y-6 p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg"
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: themeForm.fontFamily
      }}
    >
      {/* Header Preview */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: themeForm.primaryColor,
          color: getContrastColor(themeForm.primaryColor)
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {themeForm.logoUrl && (
              <img src={themeForm.logoUrl} alt="Logo" className="w-8 h-8 rounded" />
            )}
            <h2 className="text-xl font-bold">{selectedBranch?.name || 'Branch Name'}</h2>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            Live Preview
          </Badge>
        </div>
      </div>

      {/* Content Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div
          className={`p-4 border-2 ${themeForm.borderRadius === 'none' ? 'rounded-none' :
            themeForm.borderRadius === 'small' ? 'rounded-sm' :
            themeForm.borderRadius === 'medium' ? 'rounded-md' : 'rounded-lg'}`}
          style={{
            borderColor: themeForm.secondaryColor,
            backgroundColor: '#ffffff'
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: themeForm.primaryColor }}>
            Vehicle Inventory
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Manage your vehicle listings and track performance
          </p>
          <Button
            size="sm"
            className={`${themeForm.buttonStyle === 'rounded' ? 'rounded-md' :
              themeForm.buttonStyle === 'square' ? 'rounded-none' : 'rounded-full'}`}
            style={{
              backgroundColor: themeForm.accentColor,
              color: getContrastColor(themeForm.accentColor)
            }}
          >
            View Inventory
          </Button>
        </div>

        {/* Card 2 */}
        <div
          className={`p-4 border-2 ${themeForm.borderRadius === 'none' ? 'rounded-none' :
            themeForm.borderRadius === 'small' ? 'rounded-sm' :
            themeForm.borderRadius === 'medium' ? 'rounded-md' : 'rounded-lg'}`}
          style={{
            borderColor: themeForm.secondaryColor,
            backgroundColor: '#ffffff'
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: themeForm.primaryColor }}>
            Sales Analytics
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Track sales performance and revenue metrics
          </p>
          <Button
            size="sm"
            variant="outline"
            className={`${themeForm.buttonStyle === 'rounded' ? 'rounded-md' :
              themeForm.buttonStyle === 'square' ? 'rounded-none' : 'rounded-full'}`}
            style={{
              borderColor: themeForm.accentColor,
              color: themeForm.accentColor
            }}
          >
            View Reports
          </Button>
        </div>

        {/* Card 3 */}
        <div
          className={`p-4 border-2 ${themeForm.borderRadius === 'none' ? 'rounded-none' :
            themeForm.borderRadius === 'small' ? 'rounded-sm' :
            themeForm.borderRadius === 'medium' ? 'rounded-md' : 'rounded-lg'}`}
          style={{
            borderColor: themeForm.secondaryColor,
            backgroundColor: '#ffffff'
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: themeForm.primaryColor }}>
            Customer Support
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Help customers find their perfect vehicle
          </p>
          <Button
            size="sm"
            className={`${themeForm.buttonStyle === 'rounded' ? 'rounded-md' :
              themeForm.buttonStyle === 'square' ? 'rounded-none' : 'rounded-full'}`}
            style={{
              backgroundColor: themeForm.primaryColor,
              color: getContrastColor(themeForm.primaryColor)
            }}
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Banner Preview */}
      {themeForm.bannerUrl && (
        <div className="mt-4">
          <img
            src={themeForm.bannerUrl}
            alt="Banner"
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Branch Theming System
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Customize the look and feel of each branch location
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit Theme' : 'Live Preview'}
          </Button>
          <Button onClick={handleExportTheme} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Branch Selector */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Branch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBranch?.id === branch.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedBranch(branch)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4" />
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {branch.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {branch.city} • {branch.type}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Theme Editor */}
        <div className="lg:col-span-3">
          {selectedBranch ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Theme for {selectedBranch.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleResetTheme} variant="outline" size="sm">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                    <Button onClick={handleSaveTheme} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-3 h-3 mr-1" />
                      Save Theme
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {previewMode ? (
                  <ThemePreview />
                ) : (
                  <Tabs defaultValue="colors" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="colors">Colors</TabsTrigger>
                      <TabsTrigger value="branding">Branding</TabsTrigger>
                      <TabsTrigger value="typography">Typography</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    {/* Colors Tab */}
                    <TabsContent value="colors" className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Color Presets</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {PRESET_COLORS.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => handleApplyPreset(preset)}
                              className="p-3 border rounded-lg hover:border-slate-400 transition-colors"
                            >
                              <div className="flex gap-1 mb-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: preset.primary }}
                                />
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: preset.secondary }}
                                />
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: preset.accent }}
                                />
                              </div>
                              <p className="text-xs font-medium">{preset.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label htmlFor="primary_color">Primary Color</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              id="primary_color"
                              type="color"
                              value={themeForm.primaryColor}
                              onChange={(e) => setThemeForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={themeForm.primaryColor}
                              onChange={(e) => setThemeForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                              placeholder="#2563eb"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="secondary_color">Secondary Color</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              id="secondary_color"
                              type="color"
                              value={themeForm.secondaryColor}
                              onChange={(e) => setThemeForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={themeForm.secondaryColor}
                              onChange={(e) => setThemeForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                              placeholder="#1d4ed8"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="accent_color">Accent Color</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              id="accent_color"
                              type="color"
                              value={themeForm.accentColor}
                              onChange={(e) => setThemeForm(prev => ({ ...prev, accentColor: e.target.value }))}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={themeForm.accentColor}
                              onChange={(e) => setThemeForm(prev => ({ ...prev, accentColor: e.target.value }))}
                              placeholder="#3b82f6"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Branding Tab */}
                    <TabsContent value="branding" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="logo_url">Logo URL</Label>
                          <Input
                            id="logo_url"
                            value={themeForm.logoUrl}
                            onChange={(e) => setThemeForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                            placeholder="https://example.com/logo.png"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Recommended size: 200x200px, PNG or SVG format
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="banner_url">Banner URL</Label>
                          <Input
                            id="banner_url"
                            value={themeForm.bannerUrl}
                            onChange={(e) => setThemeForm(prev => ({ ...prev, bannerUrl: e.target.value }))}
                            placeholder="https://example.com/banner.jpg"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Recommended size: 1200x300px, JPG or PNG format
                          </p>
                        </div>
                      </div>

                      {/* Preview Images */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {themeForm.logoUrl && (
                          <div>
                            <Label className="text-sm font-medium">Logo Preview</Label>
                            <div className="mt-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                              <img
                                src={themeForm.logoUrl}
                                alt="Logo preview"
                                className="max-w-full max-h-20 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {themeForm.bannerUrl && (
                          <div>
                            <Label className="text-sm font-medium">Banner Preview</Label>
                            <div className="mt-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                              <img
                                src={themeForm.bannerUrl}
                                alt="Banner preview"
                                className="w-full max-h-20 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Typography Tab */}
                    <TabsContent value="typography" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="font_family">Font Family</Label>
                          <Select
                            value={themeForm.fontFamily}
                            onValueChange={(value) => setThemeForm(prev => ({ ...prev, fontFamily: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_FAMILIES.map(font => (
                                <SelectItem key={font.value} value={font.value}>
                                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="border_radius">Border Radius</Label>
                          <Select
                            value={themeForm.borderRadius}
                            onValueChange={(value) => setThemeForm(prev => ({
                              ...prev,
                              borderRadius: value as BranchThemeType['borderRadius']
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BORDER_RADIUS_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="button_style">Button Style</Label>
                        <Select
                          value={themeForm.buttonStyle}
                          onValueChange={(value) => setThemeForm(prev => ({
                            ...prev,
                            buttonStyle: value as BranchThemeType['buttonStyle']
                          }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BUTTON_STYLES.map(style => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="space-y-6">
                      <div>
                        <Label htmlFor="custom_css">Custom CSS</Label>
                        <textarea
                          id="custom_css"
                          value={themeForm.customCss}
                          onChange={(e) => setThemeForm(prev => ({ ...prev, customCss: e.target.value }))}
                          placeholder="/* Add custom CSS styles here */"
                          className="w-full h-40 p-3 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Advanced users only. Custom CSS will be applied to this branch's interface.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Palette className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Select a Branch
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Choose a branch to customize its theme and branding
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
