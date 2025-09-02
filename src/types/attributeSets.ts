// ===== ATTRIBUTE SETS TYPES =====

// Base field types for attribute sets
export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'textarea'
  | 'file'
  | 'range';

// Validation rules for fields
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

// Enhanced field dependency rules
export interface FieldDependency {
  id: string;
  source_field_id: string;
  target_field_id: string;
  condition: DependencyCondition;
  action: DependencyAction;
  priority?: number;
  enabled: boolean;
  description?: string;
}

export interface DependencyCondition {
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range' | 'matches_regex' | 'is_empty' | 'is_not_empty' | 'has_value';
  value: any;
  values?: any[]; // For 'in' operations
  case_sensitive?: boolean;
  field_path?: string; // For nested field references
}

export interface DependencyAction {
  type: 'show' | 'hide' | 'enable' | 'disable' | 'set_value' | 'clear_value' | 'set_options' | 'add_class' | 'remove_class' | 'set_required' | 'set_optional';
  target_value?: any;
  target_options?: { label: string; value: any; group?: string }[];
  target_class?: string;
  message?: string;
  severity?: 'info' | 'warning' | 'error';
  field_path?: string; // For nested field updates
}

export interface FieldDependencyRule {
  id: string;
  name: string;
  description: string;
  dependencies: FieldDependency[];
  attribute_set_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  priority: number; // Rule execution order
}

export interface DependencyEvaluationContext {
  field_values: Record<string, any>;
  user_role?: string;
  dealer_tier?: string;
  branch_type?: string;
  business_type?: string;
  current_form_step?: string;
  previous_selections?: Record<string, any>;
}

export interface DependencyEvaluationResult {
  field_id: string;
  actions: DependencyAction[];
  messages: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
    field_id?: string;
  }>;
  validation_errors: Array<{
    field_id: string;
    error: string;
  }>;
}

// Individual field in an attribute set
export interface AttributeField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: { label: string; value: any; group?: string }[]; // For select/multiselect
  validation?: FieldValidation;
  dependencies?: FieldDependency[]; // Enhanced field dependencies
  order: number;
  isRequired: boolean;
  isVisible: boolean;
  category: string; // e.g., 'engine', 'interior', 'safety', etc.
  unit?: string; // e.g., 'km', 'liters', 'kg', etc.
  precision?: number; // For number fields
  group?: string; // For grouping related fields
  tooltip?: string; // Help tooltip
  conditionalRequired?: boolean; // Becomes required based on dependencies
}

// Attribute set definition
export interface AttributeSet {
  id: string;
  name: string;
  description: string;
  category: 'car' | 'bike' | 'truck' | 'commercial';
  fields: AttributeField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Attribute set instance (applied to a vehicle)
export interface VehicleAttributeSet {
  vehicleId: string;
  attributeSetId: string;
  values: Record<string, any>; // fieldId -> value mapping
  isCompleted: boolean;
  completedAt?: string;
}

// VIN mapping rules
export interface VINMappingRule {
  id: string;
  brand: string;
  model?: string;
  yearRange?: { start: number; end: number };
  vinPattern: string; // Regex pattern to match VIN
  fieldMappings: Record<string, string>; // VIN position -> fieldId
  isActive: boolean;
  priority: number; // Higher priority rules are checked first
  createdAt: string;
  updatedAt: string;
}

// VIN decode result
export interface VINDecodeResult {
  success: boolean;
  brand?: string;
  model?: string;
  year?: number;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  bodyType?: string;
  color?: string;
  additionalSpecs?: Record<string, any>;
  decodedValues?: Record<string, any>; // Values decoded from VIN mapping
  confidence: number; // 0-100
  source: 'api' | 'local_mapping' | 'manual';
}

// ===== BRANCH HIERARCHY TYPES =====

// Branch hierarchy levels
export type BranchLevel = 'head_office' | 'regional_office' | 'main_branch' | 'sub_branch' | 'outlet' | 'kiosk';

// Branch hierarchy node
export interface BranchHierarchyNode {
  id: string;
  name: string;
  level: BranchLevel;
  parentId?: string;
  children: BranchHierarchyNode[];
  path: string[]; // Array of ancestor IDs for quick lookups
  depth: number;
  branchType: 'showroom' | 'workshop' | 'warehouse' | 'kiosk' | 'outlet';
  region?: string;
  city?: string;
  address?: string;
  phone?: string;
  managerId?: string;
  employeeCount?: number;
  monthlyTarget?: number;
  isActive: boolean;
  permissions?: BranchPermissions;
}

// Branch permissions for hierarchical access
export interface BranchPermissions {
  canViewParent: boolean;
  canViewSiblings: boolean;
  canViewChildren: boolean;
  canTransferToParent: boolean;
  canTransferToSiblings: boolean;
  canTransferToChildren: boolean;
  canManageChildren: boolean;
  canApproveFromChildren: boolean;
}

// Branch theme configuration
export interface BranchTheme {
  branchId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  bannerUrl?: string;
  fontFamily: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  buttonStyle: 'rounded' | 'square' | 'pill';
  customCss?: string;
}

// Branch theme preview
export interface ThemePreview {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  sampleText: string;
  buttonText: string;
}

// ===== ATTRIBUTE SETS API TYPES =====

// Create attribute set request
export interface CreateAttributeSetRequest {
  name: string;
  description: string;
  category: AttributeSet['category'];
  fields: Omit<AttributeField, 'id'>[];
}

// Update attribute set request
export interface UpdateAttributeSetRequest {
  name?: string;
  description?: string;
  fields?: AttributeField[];
  isActive?: boolean;
}

// Apply attribute set to vehicle
export interface ApplyAttributeSetRequest {
  vehicleId: string;
  attributeSetId: string;
  initialValues?: Record<string, any>;
}

// VIN decode request
export interface VINDecodeRequest {
  vin: string;
  brand?: string; // Optional hint for better matching
  year?: number;  // Optional hint for better matching
}

// ===== BRANCH HIERARCHY API TYPES =====

// Create branch hierarchy request
export interface CreateBranchHierarchyRequest {
  name: string;
  level: BranchLevel;
  parentId?: string;
  branchType: BranchHierarchyNode['branchType'];
  region?: string;
  city?: string;
  address?: string;
  phone?: string;
  managerId?: string;
  permissions?: BranchPermissions;
}

// Update branch hierarchy request
export interface UpdateBranchHierarchyRequest {
  name?: string;
  branchType?: BranchHierarchyNode['branchType'];
  region?: string;
  city?: string;
  address?: string;
  phone?: string;
  managerId?: string;
  permissions?: BranchPermissions;
  isActive?: boolean;
}

// Move branch in hierarchy
export interface MoveBranchRequest {
  branchId: string;
  newParentId?: string; // undefined = move to root level
}

// Update branch theme
export interface UpdateBranchThemeRequest {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
  fontFamily?: string;
  borderRadius?: BranchTheme['borderRadius'];
  buttonStyle?: BranchTheme['buttonStyle'];
  customCss?: string;
}

// ===== UTILITY TYPES =====

// Form field props for dynamic rendering
export interface DynamicFieldProps {
  field: AttributeField;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Attribute set form state
export interface AttributeSetFormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Branch hierarchy tree node for UI
export interface BranchTreeNode extends BranchHierarchyNode {
  isExpanded?: boolean;
  isSelected?: boolean;
  isDraggable?: boolean;
  isDroppable?: boolean;
  children: BranchTreeNode[];
}
