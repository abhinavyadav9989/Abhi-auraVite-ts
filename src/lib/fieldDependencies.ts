import {
  FieldDependency,
  DependencyCondition,
  DependencyAction,
  DependencyEvaluationContext,
  DependencyEvaluationResult,
  FieldDependencyRule,
  AttributeField
} from '@/types/attributeSets';

/**
 * Field Dependencies Service
 * Handles evaluation and application of field dependency rules
 */
export class FieldDependenciesService {
  /**
   * Evaluate all dependencies for a given field context
   */
  static evaluateDependencies(
    dependencies: FieldDependency[],
    context: DependencyEvaluationContext
  ): Map<string, DependencyEvaluationResult> {
    const results = new Map<string, DependencyEvaluationResult>();

    // Group dependencies by target field for efficient processing
    const dependenciesByTarget = new Map<string, FieldDependency[]>();
    dependencies.forEach(dep => {
      if (!dependenciesByTarget.has(dep.target_field_id)) {
        dependenciesByTarget.set(dep.target_field_id, []);
      }
      dependenciesByTarget.get(dep.target_field_id)!.push(dep);
    });

    // Evaluate each target field's dependencies
    for (const [targetFieldId, fieldDeps] of dependenciesByTarget) {
      const result = this.evaluateFieldDependencies(fieldDeps, context);
      if (result.actions.length > 0 || result.messages.length > 0 || result.validation_errors.length > 0) {
        results.set(targetFieldId, result);
      }
    }

    return results;
  }

  /**
   * Evaluate dependencies for a specific target field
   */
  private static evaluateFieldDependencies(
    dependencies: FieldDependency[],
    context: DependencyEvaluationContext
  ): DependencyEvaluationResult {
    const result: DependencyEvaluationResult = {
      field_id: dependencies[0]?.target_field_id || '',
      actions: [],
      messages: [],
      validation_errors: []
    };

    // Sort dependencies by priority (higher priority first)
    const sortedDeps = dependencies
      .filter(dep => dep.enabled)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const dependency of sortedDeps) {
      if (this.evaluateCondition(dependency.condition, context)) {
        // Condition met, apply action
        result.actions.push(dependency.action);

        // Add message if specified
        if (dependency.action.message) {
          result.messages.push({
            type: dependency.action.severity || 'info',
            message: dependency.action.message,
            field_id: dependency.target_field_id
          });
        }
      }
    }

    return result;
  }

  /**
   * Evaluate a single dependency condition
   */
  private static evaluateCondition(
    condition: DependencyCondition,
    context: DependencyEvaluationContext
  ): boolean {
    const sourceValue = this.getFieldValue(condition.field_path || '', context);

    switch (condition.operator) {
      case 'equals':
        return this.compareValues(sourceValue, condition.value, condition.case_sensitive);

      case 'not_equals':
        return !this.compareValues(sourceValue, condition.value, condition.case_sensitive);

      case 'contains':
        if (typeof sourceValue !== 'string' || typeof condition.value !== 'string') {
          return false;
        }
        const searchValue = condition.case_sensitive !== false ? sourceValue : sourceValue.toLowerCase();
        const targetValue = condition.case_sensitive !== false ? condition.value : condition.value.toLowerCase();
        return searchValue.includes(targetValue);

      case 'greater_than':
        return Number(sourceValue) > Number(condition.value);

      case 'less_than':
        return Number(sourceValue) < Number(condition.value);

      case 'in_range':
        if (!Array.isArray(condition.values) || condition.values.length !== 2) {
          return false;
        }
        const numValue = Number(sourceValue);
        return numValue >= Number(condition.values[0]) && numValue <= Number(condition.values[1]);

      case 'matches_regex':
        if (typeof sourceValue !== 'string' || typeof condition.value !== 'string') {
          return false;
        }
        try {
          const regex = new RegExp(condition.value, condition.case_sensitive ? 'g' : 'gi');
          return regex.test(sourceValue);
        } catch {
          return false;
        }

      case 'is_empty':
        return sourceValue === null || sourceValue === undefined ||
               sourceValue === '' || (Array.isArray(sourceValue) && sourceValue.length === 0);

      case 'is_not_empty':
        return !this.evaluateCondition({ ...condition, operator: 'is_empty' }, context);

      case 'has_value':
        return sourceValue !== null && sourceValue !== undefined && sourceValue !== '';

      default:
        return false;
    }
  }

  /**
   * Get field value from context using field path
   */
  private static getFieldValue(fieldPath: string, context: DependencyEvaluationContext): any {
    if (!fieldPath) return null;

    // Handle nested field paths like "vehicle.make" or "user.role"
    const pathParts = fieldPath.split('.');

    let currentValue: any = context.field_values;

    for (const part of pathParts) {
      if (currentValue && typeof currentValue === 'object' && part in currentValue) {
        currentValue = currentValue[part];
      } else {
        // Check context properties
        if (part === 'user_role') currentValue = context.user_role;
        else if (part === 'dealer_tier') currentValue = context.dealer_tier;
        else if (part === 'branch_type') currentValue = context.branch_type;
        else if (part === 'business_type') currentValue = context.business_type;
        else if (part === 'current_form_step') currentValue = context.current_form_step;
        else currentValue = undefined;
        break;
      }
    }

    return currentValue;
  }

  /**
   * Compare two values with case sensitivity option
   */
  private static compareValues(value1: any, value2: any, caseSensitive: boolean = true): boolean {
    if (value1 === value2) return true;

    if (!caseSensitive && typeof value1 === 'string' && typeof value2 === 'string') {
      return value1.toLowerCase() === value2.toLowerCase();
    }

    return false;
  }

  /**
   * Apply dependency actions to form fields
   */
  static applyActions(
    actions: DependencyAction[],
    currentFieldStates: Map<string, any>,
    fieldDefinitions: Map<string, AttributeField>
  ): Map<string, any> {
    const updatedStates = new Map(currentFieldStates);

    for (const action of actions) {
      const fieldId = action.field_path || '';
      const fieldDef = fieldDefinitions.get(fieldId);
      if (!fieldDef) continue;

      const currentState = updatedStates.get(fieldId) || {
        isVisible: fieldDef.isVisible,
        isRequired: fieldDef.isRequired,
        value: null,
        options: fieldDef.options || [],
        className: ''
      };

      switch (action.type) {
        case 'show':
          currentState.isVisible = true;
          break;

        case 'hide':
          currentState.isVisible = false;
          break;

        case 'enable':
          currentState.disabled = false;
          break;

        case 'disable':
          currentState.disabled = true;
          break;

        case 'set_value':
          currentState.value = action.target_value;
          break;

        case 'clear_value':
          currentState.value = null;
          break;

        case 'set_options':
          if (action.target_options) {
            currentState.options = action.target_options;
          }
          break;

        case 'add_class':
          if (action.target_class) {
            currentState.className = (currentState.className || '') + ' ' + action.target_class;
          }
          break;

        case 'remove_class':
          if (action.target_class && currentState.className) {
            currentState.className = currentState.className.replace(action.target_class, '').trim();
          }
          break;

        case 'set_required':
          currentState.isRequired = true;
          break;

        case 'set_optional':
          currentState.isRequired = false;
          break;
      }

      updatedStates.set(fieldId, currentState);
    }

    return updatedStates;
  }

  /**
   * Create common dependency patterns
   */
  static createCommonDependencies(): FieldDependencyRule[] {
    return [
      // Business type dependencies (Used vs New car)
      {
        id: 'business_type_brand_setup',
        name: 'Brand Setup for Business Type',
        description: 'Show brand setup only for new car dealers',
        dependencies: [
          {
            id: 'hide_brand_for_used',
            source_field_id: 'business_type',
            target_field_id: 'brand_setup_section',
            condition: {
              operator: 'equals',
              value: 'used'
            },
            action: {
              type: 'hide',
              message: 'Brand setup not required for used car dealers'
            },
            priority: 10,
            enabled: true
          }
        ],
        attribute_set_id: 'dealer_setup',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        priority: 1
      },

      // Vehicle type dependencies
      {
        id: 'vehicle_type_transmission',
        name: 'Transmission Options by Vehicle Type',
        description: 'Show appropriate transmission options based on vehicle type',
        dependencies: [
          {
            id: 'automatic_for_luxury',
            source_field_id: 'vehicle_category',
            target_field_id: 'transmission_type',
            condition: {
              operator: 'equals',
              value: 'luxury'
            },
            action: {
              type: 'set_options',
              target_options: [
                { label: 'Automatic', value: 'automatic' },
                { label: 'CVT', value: 'cvt' },
                { label: 'DCT', value: 'dct' }
              ]
            },
            priority: 5,
            enabled: true
          }
        ],
        attribute_set_id: 'vehicle_specs',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        priority: 2
      },

      // Fuel type dependencies
      {
        id: 'fuel_type_engine_specs',
        name: 'Engine Specs by Fuel Type',
        description: 'Show relevant engine fields based on fuel type',
        dependencies: [
          {
            id: 'electric_battery',
            source_field_id: 'fuel_type',
            target_field_id: 'battery_capacity',
            condition: {
              operator: 'equals',
              value: 'electric'
            },
            action: {
              type: 'show',
              message: 'Battery capacity is required for electric vehicles'
            },
            priority: 8,
            enabled: true
          },
          {
            id: 'hide_battery_for_fuel',
            source_field_id: 'fuel_type',
            target_field_id: 'battery_capacity',
            condition: {
              operator: 'not_equals',
              value: 'electric'
            },
            action: {
              type: 'hide'
            },
            priority: 7,
            enabled: true
          }
        ],
        attribute_set_id: 'vehicle_specs',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        priority: 3
      }
    ];
  }

  /**
   * Validate dependency rules for consistency
   */
  static validateDependencyRules(rules: FieldDependencyRule[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      // Check for circular dependencies
      const dependencyMap = new Map<string, string[]>();
      for (const dep of rule.dependencies) {
        if (!dependencyMap.has(dep.source_field_id)) {
          dependencyMap.set(dep.source_field_id, []);
        }
        dependencyMap.get(dep.source_field_id)!.push(dep.target_field_id);
      }

      // Simple cycle detection
      for (const [source, targets] of dependencyMap) {
        if (targets.includes(source)) {
          errors.push(`Rule "${rule.name}": Circular dependency detected for field "${source}"`);
        }
      }

      // Check for conflicting actions on same target field
      const actionsByTarget = new Map<string, DependencyAction[]>();
      for (const dep of rule.dependencies) {
        if (!actionsByTarget.has(dep.target_field_id)) {
          actionsByTarget.set(dep.target_field_id, []);
        }
        actionsByTarget.get(dep.target_field_id)!.push(dep.action);
      }

      for (const [target, actions] of actionsByTarget) {
        const showHide = actions.filter(a => ['show', 'hide'].includes(a.type));
        if (showHide.length > 1) {
          warnings.push(`Rule "${rule.name}": Multiple show/hide actions on field "${target}"`);
        }

        const enableDisable = actions.filter(a => ['enable', 'disable'].includes(a.type));
        if (enableDisable.length > 1) {
          warnings.push(`Rule "${rule.name}": Multiple enable/disable actions on field "${target}"`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default FieldDependenciesService;
