import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus,
  Settings,
  Edit,
  Trash2,
  Copy,
  Save,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Move,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  AttributeSet,
  AttributeField,
  FieldType,
  FieldDependency,
  AttributeSet as AttributeSetType,
  FieldValidation
} from '@/types/attributeSets';
import { AttributeSet as AttributeSetEntity } from '@/api/entityAdapters';

interface AttributeSetsManagementProps {
  dealerId: string;
}

const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Text', description: 'Single line text input' },
  { value: 'number', label: 'Number', description: 'Numeric input with validation' },
  { value: 'boolean', label: 'Yes/No', description: 'Toggle switch' },
  { value: 'select', label: 'Dropdown', description: 'Single selection from options' },
  { value: 'multiselect', label: 'Multi-Select', description: 'Multiple selections from options' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'textarea', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'file', label: 'File Upload', description: 'Document or image upload' },
  { value: 'range', label: 'Range/Slider', description: 'Numeric range input' }
];

const CATEGORY_OPTIONS = [
  { value: 'car', label: 'Cars', description: 'Passenger vehicles' },
  { value: 'bike', label: 'Bikes', description: 'Two-wheeled vehicles' },
  { value: 'truck', label: 'Trucks', description: 'Commercial vehicles' },
  { value: 'commercial', label: 'Commercial', description: 'Other commercial vehicles' }
];

export default function AttributeSetsManagement({ dealerId }: AttributeSetsManagementProps) {
  const [attributeSets, setAttributeSets] = useState<AttributeSetType[]>([]);
  const [selectedSet, setSelectedSet] = useState<AttributeSetType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState<AttributeField | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [draggedOverField, setDraggedOverField] = useState<string | null>(null);
  const { toast } = useToast();

  // Form states
  const [setForm, setSetForm] = useState({
    name: '',
    description: '',
    category: 'car' as AttributeSet['category']
  });

  const [fieldForm, setFieldForm] = useState({
    name: '',
    label: '',
    type: 'text' as FieldType,
    placeholder: '',
    helpText: '',
    defaultValue: '',
    isRequired: false,
    category: 'engine',
    unit: '',
    precision: 0,
    validation: {} as FieldValidation,
    options: [] as { label: string; value: any; group?: string }[],
    dependencies: [] as FieldDependency[]
  });

  useEffect(() => {
    loadAttributeSets();
  }, []);

  const loadAttributeSets = async () => {
    try {
      const { data, error } = await AttributeSetEntity.list();
      if (error) throw error;

      setAttributeSets(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load attribute sets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSet = async () => {
    if (!setForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the attribute set",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSet = {
        name: setForm.name,
        description: setForm.description,
        category: setForm.category,
        fields: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: dealerId
      };

      const { data, error } = await AttributeSetEntity.create(newSet);
      if (error) throw error;

      setAttributeSets(prev => [...prev, data]);
      setSetForm({ name: '', description: '', category: 'car' });
      setShowCreateDialog(false);

      toast({
        title: "Success",
        description: `${data.name} attribute set created`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create attribute set",
        variant: "destructive",
      });
    }
  };

  const handleSaveField = () => {
    if (!fieldForm.name.trim() || !fieldForm.label.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSet) return;

    const field: AttributeField = {
      id: editingField?.id || `field_${Date.now()}`,
      name: fieldForm.name,
      label: fieldForm.label,
      type: fieldForm.type,
      placeholder: fieldForm.placeholder,
      helpText: fieldForm.helpText,
      defaultValue: fieldForm.defaultValue,
      options: fieldForm.options,
      validation: fieldForm.validation,
      dependencies: fieldForm.dependencies,
      order: editingField ? editingField.order : selectedSet.fields.length,
      isRequired: fieldForm.isRequired,
      isVisible: true,
      category: fieldForm.category,
      unit: fieldForm.unit,
      precision: fieldForm.precision
    };

    const updatedSet = { ...selectedSet };
    if (editingField) {
      // Update existing field
      const index = updatedSet.fields.findIndex(f => f.id === editingField.id);
      if (index !== -1) {
        updatedSet.fields[index] = field;
      }
    } else {
      // Add new field
      updatedSet.fields.push(field);
    }

    setSelectedSet(updatedSet);
    setAttributeSets(prev =>
      prev.map(set => set.id === updatedSet.id ? updatedSet : set)
    );

    // Reset form
    setFieldForm({
      name: '',
      label: '',
      type: 'text',
      placeholder: '',
      helpText: '',
      defaultValue: '',
      isRequired: false,
      category: 'engine',
      unit: '',
      precision: 0,
      validation: {},
      options: [] as { label: string; value: any; group?: string }[],
      dependencies: []
    });
    setEditingField(null);
    setShowFieldDialog(false);

    toast({
      title: "Success",
      description: editingField ? "Field updated" : "Field added",
    });
  };

  const handleDeleteField = (fieldId: string) => {
    if (!selectedSet) return;

    const updatedSet = {
      ...selectedSet,
      fields: selectedSet.fields.filter(f => f.id !== fieldId)
    };

    setSelectedSet(updatedSet);
    setAttributeSets(prev =>
      prev.map(set => set.id === updatedSet.id ? updatedSet : set)
    );

    toast({
      title: "Field Deleted",
      description: "Field has been removed from the attribute set",
    });
  };

  const handleDragStart = (fieldId: string) => {
    setDraggedField(fieldId);
  };

  const handleDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    setDraggedOverField(fieldId);
  };

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();

    if (!draggedField || !selectedSet) return;

    const fields = [...selectedSet.fields];
    const draggedIndex = fields.findIndex(f => f.id === draggedField);
    const targetIndex = fields.findIndex(f => f.id === targetFieldId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder fields
    const [draggedItem] = fields.splice(draggedIndex, 1);
    fields.splice(targetIndex, 0, draggedItem);

    // Update order values
    fields.forEach((field, index) => {
      field.order = index;
    });

    const updatedSet = { ...selectedSet, fields };
    setSelectedSet(updatedSet);
    setAttributeSets(prev =>
      prev.map(set => set.id === updatedSet.id ? updatedSet : set)
    );

    setDraggedField(null);
    setDraggedOverField(null);
  };

  const handleSaveSet = async () => {
    if (!selectedSet) return;

    try {
      const { error } = await AttributeSetEntity.update(selectedSet.id, {
        fields: selectedSet.fields,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attribute set saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save attribute set",
        variant: "destructive",
      });
    }
  };

  const getFieldTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '✓';
      case 'select': return '▼';
      case 'multiselect': return '☑';
      case 'date': return '📅';
      case 'textarea': return '📄';
      case 'file': return '📎';
      case 'range': return '⚖';
      default: return '📝';
    }
  };

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
            Attribute Sets Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage dynamic form fields for different vehicle types
          </p>
        </div>

        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Attribute Set
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attribute Sets List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Attribute Sets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attributeSets.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No attribute sets created yet</p>
                  <p className="text-sm">Create your first attribute set to get started</p>
                </div>
              ) : (
                attributeSets.map((set) => (
                  <div
                    key={set.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSet?.id === set.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedSet(set)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">{set.name}</h4>
                      <Badge variant={set.isActive ? "default" : "secondary"}>
                        {set.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {set.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{CATEGORY_OPTIONS.find(c => c.value === set.category)?.label}</span>
                      <span>{set.fields.length} fields</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attribute Set Editor */}
        <div className="lg:col-span-2">
          {selectedSet ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedSet.name}
                      <Badge variant="outline">
                        {CATEGORY_OPTIONS.find(c => c.value === selectedSet.category)?.label}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {selectedSet.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveSet} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setShowFieldDialog(true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Fields ({selectedSet.fields.length})</h4>
                    <div className="text-sm text-slate-500">
                      Drag and drop to reorder fields
                    </div>
                  </div>

                  {selectedSet.fields.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        No fields added yet
                      </p>
                      <Button
                        onClick={() => setShowFieldDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Field
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedSet.fields.map((field) => (
                        <div
                          key={field.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            draggedOverField === field.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                          draggable
                          onDragStart={() => handleDragStart(field.id)}
                          onDragOver={(e) => handleDragOver(e, field.id)}
                          onDrop={(e) => handleDrop(e, field.id)}
                        >
                          <div className="flex items-center gap-4">
                            <GripVertical className="w-5 h-5 text-slate-400 cursor-move" />

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                                <h5 className="font-medium text-slate-900 dark:text-white">
                                  {field.label}
                                </h5>
                                {field.isRequired && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {field.name} • {FIELD_TYPE_OPTIONS.find(t => t.value === field.type)?.label}
                              </p>
                              {field.helpText && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {field.helpText}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingField(field);
                                  setFieldForm({
                                    name: field.name,
                                    label: field.label,
                                    type: field.type,
                                    placeholder: field.placeholder || '',
                                    helpText: field.helpText || '',
                                    defaultValue: field.defaultValue || '',
                                    isRequired: field.isRequired,
                                    category: field.category,
                                    unit: field.unit || '',
                                    precision: field.precision || 0,
                                    validation: field.validation || {},
                                    options: field.options || [],
                                    dependencies: field.dependencies || []
                                  });
                                  setShowFieldDialog(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteField(field.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Settings className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Select an Attribute Set
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Choose an attribute set from the list to view and edit its fields
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Attribute Set Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Attribute Set</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="set_name">Name *</Label>
              <Input
                id="set_name"
                value={setForm.name}
                onChange={(e) => setSetForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Car Engine Specifications"
              />
            </div>

            <div>
              <Label htmlFor="set_description">Description</Label>
              <Textarea
                id="set_description"
                value={setForm.description}
                onChange={(e) => setSetForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this attribute set is for..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="set_category">Category *</Label>
              <Select
                value={setForm.category}
                onValueChange={(value) => setSetForm(prev => ({ ...prev, category: value as AttributeSet['category'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSet} className="bg-blue-600 hover:bg-blue-700">
              Create Attribute Set
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Editor Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Field' : 'Add New Field'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field_name">Field Name *</Label>
                <Input
                  id="field_name"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., engine_power"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Internal name (no spaces, lowercase)
                </p>
              </div>

              <div>
                <Label htmlFor="field_label">Display Label *</Label>
                <Input
                  id="field_label"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Engine Power"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field_type">Field Type *</Label>
                <Select
                  value={fieldForm.type}
                  onValueChange={(value) => setFieldForm(prev => ({ ...prev, type: value as FieldType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {getFieldTypeIcon(option.value as FieldType)} {option.label} - {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="field_category">Category</Label>
                <Input
                  id="field_category"
                  value={fieldForm.category}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., engine, interior, safety"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field_placeholder">Placeholder</Label>
                <Input
                  id="field_placeholder"
                  value={fieldForm.placeholder}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, placeholder: e.target.value }))}
                  placeholder="Help text shown in empty field"
                />
              </div>

              <div>
                <Label htmlFor="field_unit">Unit</Label>
                <Input
                  id="field_unit"
                  value={fieldForm.unit}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., HP, km, liters"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="field_help">Help Text</Label>
              <Textarea
                id="field_help"
                value={fieldForm.helpText}
                onChange={(e) => setFieldForm(prev => ({ ...prev, helpText: e.target.value }))}
                placeholder="Additional help or instructions for users"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field_required"
                checked={fieldForm.isRequired}
                onCheckedChange={(checked) => setFieldForm(prev => ({ ...prev, isRequired: !!checked }))}
              />
              <Label htmlFor="field_required">Required field</Label>
            </div>

            {/* Options for select/multiselect fields */}
            {(fieldForm.type === 'select' || fieldForm.type === 'multiselect') && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2 mt-2">
                  {fieldForm.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...fieldForm.options];
                          newOptions[index] = e.target.value;
                          setFieldForm(prev => ({ ...prev, options: newOptions }));
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newOptions = fieldForm.options.filter((_, i) => i !== index);
                          setFieldForm(prev => ({ ...prev, options: newOptions }));
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFieldForm(prev => ({
                      ...prev,
                      options: [...prev.options, '']
                    }))}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowFieldDialog(false);
              setEditingField(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveField} className="bg-blue-600 hover:bg-blue-700">
              {editingField ? 'Update Field' : 'Add Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
