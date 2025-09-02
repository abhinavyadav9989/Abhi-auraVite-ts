import { ValidationError } from './vehicleValidation';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  severity: 'error' | 'warning' | 'info';
  recoverable: boolean;
  timestamp: Date;
}

export interface ErrorContext {
  step?: string;
  field?: string;
  action?: string;
  data?: any;
}

export class VehicleFlowError extends Error {
  public code: string;
  public severity: 'error' | 'warning' | 'info';
  public recoverable: boolean;
  public context?: ErrorContext;
  public timestamp: Date;

  constructor(
    code: string,
    message: string,
    severity: 'error' | 'warning' | 'info' = 'error',
    recoverable: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'VehicleFlowError';
    this.code = code;
    this.severity = severity;
    this.recoverable = recoverable;
    this.context = context;
    this.timestamp = new Date();
  }
}

// Error codes and messages
export const ERROR_CODES = {
  // Network errors
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Auto-fill errors
  AUTO_FILL_FAILED: 'AUTO_FILL_FAILED',
  RTO_API_ERROR: 'RTO_API_ERROR',
  VIN_DECODE_ERROR: 'VIN_DECODE_ERROR',
  OCR_PROCESSING_ERROR: 'OCR_PROCESSING_ERROR',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Database errors
  SAVE_FAILED: 'SAVE_FAILED',
  LOAD_FAILED: 'LOAD_FAILED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Business logic errors
  BRANCH_LIMIT_EXCEEDED: 'BRANCH_LIMIT_EXCEEDED',
  TIER_LIMIT_EXCEEDED: 'TIER_LIMIT_EXCEEDED',
  PRICE_OUT_OF_RANGE: 'PRICE_OUT_OF_RANGE'
} as const;

// Error message templates
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_OFFLINE]: 'You are offline. Please check your connection and try again.',
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error occurred. Please try again.',
  
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check the form for errors.',
  [ERROR_CODES.REQUIRED_FIELD_MISSING]: 'Required field is missing.',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid format provided.',
  
  [ERROR_CODES.AUTO_FILL_FAILED]: 'Auto-fill failed. Please enter details manually.',
  [ERROR_CODES.RTO_API_ERROR]: 'Could not fetch RTO data. Please enter details manually.',
  [ERROR_CODES.VIN_DECODE_ERROR]: 'Could not decode VIN. Please enter details manually.',
  [ERROR_CODES.OCR_PROCESSING_ERROR]: 'Could not process document. Please enter details manually.',
  
  [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large. Maximum size is 10MB.',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Invalid file type. Please upload JPG, PNG, or PDF.',
  [ERROR_CODES.UPLOAD_FAILED]: 'File upload failed. Please try again.',
  
  [ERROR_CODES.SAVE_FAILED]: 'Failed to save. Please try again.',
  [ERROR_CODES.LOAD_FAILED]: 'Failed to load data. Please refresh the page.',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'This vehicle already exists in your inventory.',
  
  [ERROR_CODES.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  [ERROR_CODES.UNAUTHORIZED]: 'Please log in to continue.',
  
  [ERROR_CODES.BRANCH_LIMIT_EXCEEDED]: 'You have reached the maximum number of branches for your tier.',
  [ERROR_CODES.TIER_LIMIT_EXCEEDED]: 'You have reached the limit for your current tier.',
  [ERROR_CODES.PRICE_OUT_OF_RANGE]: 'Price is outside the allowed range.'
} as const;

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Create error from various sources
  createError(
    code: keyof typeof ERROR_CODES,
    message?: string,
    context?: ErrorContext,
    severity: 'error' | 'warning' | 'info' = 'error',
    recoverable: boolean = true
  ): VehicleFlowError {
    const errorMessage = message || ERROR_MESSAGES[code];
    return new VehicleFlowError(code, errorMessage, severity, recoverable, context);
  }

  // Handle validation errors
  handleValidationErrors(errors: ValidationError[], context?: ErrorContext): VehicleFlowError[] {
    return errors.map(error => {
      const code = this.mapValidationErrorToCode(error);
      return this.createError(
        code,
        error.message,
        { ...context, field: error.field },
        error.type,
        true
      );
    });
  }

  // Handle network errors
  handleNetworkError(error: any, context?: ErrorContext): VehicleFlowError {
    if (!navigator.onLine) {
      return this.createError('NETWORK_OFFLINE', undefined, context, 'error', true);
    }
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return this.createError('NETWORK_TIMEOUT', undefined, context, 'error', true);
    }
    
    return this.createError('NETWORK_ERROR', error.message, context, 'error', true);
  }

  // Handle file upload errors
  handleFileUploadError(error: any, context?: ErrorContext): VehicleFlowError {
    if (error.code === 'FILE_TOO_LARGE') {
      return this.createError('FILE_TOO_LARGE', undefined, context, 'error', true);
    }
    
    if (error.code === 'INVALID_FILE_TYPE') {
      return this.createError('INVALID_FILE_TYPE', undefined, context, 'error', true);
    }
    
    return this.createError('UPLOAD_FAILED', error.message, context, 'error', true);
  }

  // Handle auto-fill errors
  handleAutoFillError(source: 'rto' | 'vin' | 'ocr', error: any, context?: ErrorContext): VehicleFlowError {
    switch (source) {
      case 'rto':
        return this.createError('RTO_API_ERROR', error.message, context, 'warning', true);
      case 'vin':
        return this.createError('VIN_DECODE_ERROR', error.message, context, 'warning', true);
      case 'ocr':
        return this.createError('OCR_PROCESSING_ERROR', error.message, context, 'warning', true);
      default:
        return this.createError('AUTO_FILL_FAILED', error.message, context, 'warning', true);
    }
  }

  // Log error
  logError(error: VehicleFlowError): void {
    const appError: AppError = {
      code: error.code,
      message: error.message,
      details: error.context,
      severity: error.severity,
      recoverable: error.recoverable,
      timestamp: error.timestamp
    };

    this.errorLog.push(appError);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Vehicle Flow Error:', appError);
    }
  }

  // Get error log
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Get errors by severity
  getErrorsBySeverity(severity: 'error' | 'warning' | 'info'): AppError[] {
    return this.errorLog.filter(error => error.severity === severity);
  }

  // Get recent errors
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(-count);
  }

  // Check if user can recover from error
  canRecover(error: VehicleFlowError): boolean {
    return error.recoverable;
  }

  // Get recovery suggestions
  getRecoverySuggestions(error: VehicleFlowError): string[] {
    const suggestions: Record<string, string[]> = {
      [ERROR_CODES.NETWORK_OFFLINE]: [
        'Check your internet connection',
        'Try refreshing the page',
        'Check if the server is accessible'
      ],
      [ERROR_CODES.NETWORK_TIMEOUT]: [
        'Try again in a few moments',
        'Check your internet speed',
        'Try a different network'
      ],
      [ERROR_CODES.AUTO_FILL_FAILED]: [
        'Enter details manually',
        'Check if the input format is correct',
        'Try a different identification method'
      ],
      [ERROR_CODES.FILE_TOO_LARGE]: [
        'Compress the file',
        'Use a smaller file',
        'Split large files into smaller ones'
      ],
      [ERROR_CODES.INVALID_FILE_TYPE]: [
        'Convert to JPG, PNG, or PDF',
        'Use a different file',
        'Check file extension'
      ],
      [ERROR_CODES.DUPLICATE_ENTRY]: [
        'Check if vehicle already exists',
        'Use a different registration number',
        'Edit existing listing instead'
      ],
      [ERROR_CODES.BRANCH_LIMIT_EXCEEDED]: [
        'Upgrade to Advanced tier',
        'Delete unused branches',
        'Contact support for assistance'
      ]
    };

    return suggestions[error.code] || ['Try again', 'Contact support if problem persists'];
  }

  // Map validation error to error code
  private mapValidationErrorToCode(validationError: ValidationError): keyof typeof ERROR_CODES {
    switch (validationError.code) {
      case 'REQUIRED_FIELD':
        return 'REQUIRED_FIELD_MISSING';
      case 'INVALID_PATTERN':
      case 'INVALID_REG_FORMAT':
      case 'INVALID_VIN_LENGTH':
      case 'INVALID_VIN_CHARS':
      case 'INVALID_YEAR':
      case 'INVALID_FUEL_TYPE':
      case 'INVALID_TRANSMISSION':
      case 'INVALID_KILOMETERS':
      case 'INVALID_PRICE':
      case 'INVALID_BASE_COST':
        return 'INVALID_FORMAT';
      default:
        return 'VALIDATION_ERROR';
    }
  }
}

// Hook for error handling
export function useErrorHandler() {
  const errorHandler = ErrorHandler.getInstance();

  const handleError = (error: any, context?: ErrorContext): VehicleFlowError => {
    let vehicleError: VehicleFlowError;

    if (error instanceof VehicleFlowError) {
      vehicleError = error;
    } else if (error.name === 'NetworkError' || error.message?.includes('network')) {
      vehicleError = errorHandler.handleNetworkError(error, context);
    } else if (error.code?.includes('FILE')) {
      vehicleError = errorHandler.handleFileUploadError(error, context);
    } else {
      vehicleError = errorHandler.createError('NETWORK_ERROR', error.message, context);
    }

    errorHandler.logError(vehicleError);
    return vehicleError;
  };

  const handleValidationErrors = (errors: ValidationError[], context?: ErrorContext): VehicleFlowError[] => {
    const vehicleErrors = errorHandler.handleValidationErrors(errors, context);
    vehicleErrors.forEach(error => errorHandler.logError(error));
    return vehicleErrors;
  };

  const handleAutoFillError = (source: 'rto' | 'vin' | 'ocr', error: any, context?: ErrorContext): VehicleFlowError => {
    const vehicleError = errorHandler.handleAutoFillError(source, error, context);
    errorHandler.logError(vehicleError);
    return vehicleError;
  };

  return {
    handleError,
    handleValidationErrors,
    handleAutoFillError,
    getErrorLog: () => errorHandler.getErrorLog(),
    getRecentErrors: (count?: number) => errorHandler.getRecentErrors(count),
    getRecoverySuggestions: (error: VehicleFlowError) => errorHandler.getRecoverySuggestions(error),
    canRecover: (error: VehicleFlowError) => errorHandler.canRecover(error)
  };
}

// Error boundary component props
export interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: VehicleFlowError; resetError: () => void }>;
  onError?: (error: VehicleFlowError) => void;
  children: React.ReactNode;
}

// Error display component
export interface ErrorDisplayProps {
  error: VehicleFlowError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRecoverySuggestions?: boolean;
}
