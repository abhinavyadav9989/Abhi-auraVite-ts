import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  showStepNumbers?: boolean;
  variant?: 'default' | 'compact' | 'vertical' | 'mobile';
  className?: string;
}

export function StepProgress({
  steps,
  currentStep,
  onStepClick,
  showStepNumbers = true,
  variant = 'default',
  className
}: StepProgressProps) {
  const getStepStatus = (index: number): Step['status'] => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: Step, index: number, status: Step['status']) => {
    if (status === 'completed') {
      return <Check className="w-4 h-4 text-white" />;
    }
    if (step.icon) {
      return <step.icon className="w-4 h-4" />;
    }
    return showStepNumbers ? index + 1 : null;
  };

  const getStepClasses = (status: Step['status'], isClickable: boolean) => {
    const baseClasses = 'flex items-center justify-center rounded-full transition-all duration-200';
    
    switch (status) {
      case 'completed':
        return cn(
          baseClasses,
          'bg-green-500 text-white',
          isClickable && 'cursor-pointer hover:bg-green-600'
        );
      case 'current':
        return cn(
          baseClasses,
          'bg-blue-500 text-white ring-4 ring-blue-100',
          isClickable && 'cursor-pointer hover:bg-blue-600'
        );
      case 'error':
        return cn(
          baseClasses,
          'bg-red-500 text-white',
          isClickable && 'cursor-pointer hover:bg-red-600'
        );
      default:
        return cn(
          baseClasses,
          'bg-gray-200 text-gray-500',
          isClickable && 'cursor-pointer hover:bg-gray-300'
        );
    }
  };

  const getLineClasses = (status: Step['status']) => {
    return cn(
      'flex-1 h-0.5 transition-all duration-200',
      status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
    );
  };

  if (variant === 'vertical') {
    return (
      <div className={cn('flex flex-col space-y-4', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = onStepClick && index <= currentStep;
          
          return (
            <div key={step.id} className="flex items-start space-x-4">
              {/* Step Icon */}
              <div
                className={cn(
                  getStepClasses(status, !!isClickable),
                  'w-8 h-8 text-sm font-medium'
                )}
                onClick={() => isClickable && onStepClick(index)}
              >
                {getStepIcon(step, index, status)}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className={cn(
                    'text-sm font-medium',
                    status === 'current' ? 'text-blue-600' : 
                    status === 'completed' ? 'text-green-600' : 'text-gray-500'
                  )}>
                    {step.title}
                  </h3>
                  {status === 'current' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = onStepClick && index <= currentStep;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step Icon */}
              <div
                className={cn(
                  getStepClasses(status, !!isClickable),
                  'w-6 h-6 text-xs font-medium'
                )}
                onClick={() => isClickable && onStepClick(index)}
                title={`${step.title}: ${step.description}`}
              >
                {getStepIcon(step, index, status)}
              </div>
              
              {/* Connector */}
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Mobile variant - optimized for small screens
  if (variant === 'mobile') {
    return (
      <div className={cn('w-full px-4', className)}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isClickable = onStepClick && index <= currentStep;

            return (
              <React.Fragment key={step.id}>
                {/* Step */}
                <div className="flex flex-col items-center flex-1 max-w-[60px]">
                  <div
                    className={cn(
                      getStepClasses(status, !!isClickable),
                      'w-8 h-8 text-sm font-medium mb-1'
                    )}
                    onClick={() => isClickable && onStepClick(index)}
                  >
                    {getStepIcon(step, index, status)}
                  </div>

                  {/* Step Title - Hidden on very small screens */}
                  <h3 className={cn(
                    'text-xs font-medium text-center mb-1 hidden sm:block',
                    status === 'current' ? 'text-blue-600' :
                    status === 'completed' ? 'text-green-600' : 'text-gray-500'
                  )}>
                    {step.title.split(' ')[0]} {/* Show first word only */}
                  </h3>

                  {/* Step Number for very small screens */}
                  <span className={cn(
                    'text-xs font-medium text-center sm:hidden',
                    status === 'current' ? 'text-blue-600' :
                    status === 'completed' ? 'text-green-600' : 'text-gray-500'
                  )}>
                    {index + 1}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-2',
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Step Description */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.description}
          </p>
        </div>
      </div>
    );
  }

  // Default horizontal variant - improved for mobile
  return (
    <div className={cn('w-full px-2 md:px-0', className)}>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = onStepClick && index <= currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={cn(
                    getStepClasses(status, !!isClickable),
                    'w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm font-medium mb-1 md:mb-2'
                  )}
                  onClick={() => isClickable && onStepClick(index)}
                >
                  {getStepIcon(step, index, status)}
                </div>

                {/* Step Title */}
                <h3 className={cn(
                  'text-xs font-medium text-center mb-1 px-1',
                  status === 'current' ? 'text-blue-600' :
                  status === 'completed' ? 'text-green-600' : 'text-gray-500'
                )}>
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{step.title.split(' ')[0]}</span>
                </h3>

                {/* Step Description - Hidden on mobile */}
                <p className="hidden md:block text-xs text-gray-400 text-center max-w-20">
                  {step.description}
                </p>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className={getLineClasses(status)} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Predefined steps for vehicle adding flow
export const VEHICLE_ADDING_STEPS: Step[] = [
  {
    id: 'vehicle_type',
    title: 'Vehicle Type',
    description: 'Choose Used or New',
    status: 'pending'
  },
  {
    id: 'branch_selection',
    title: 'Branch',
    description: 'Select branch',
    status: 'pending'
  },
  {
    id: 'identify',
    title: 'Identify',
    description: 'Vehicle identification',
    status: 'pending'
  },
  {
    id: 'core_specs',
    title: 'Specs',
    description: 'Core specifications',
    status: 'pending'
  },
  {
    id: 'condition',
    title: 'Condition',
    description: 'Vehicle condition',
    status: 'pending'
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Upload documents',
    status: 'pending'
  },
  {
    id: 'media',
    title: 'Media',
    description: 'Photos & videos',
    status: 'pending'
  },
  {
    id: 'pricing',
    title: 'Pricing',
    description: 'Set pricing & exposure',
    status: 'pending'
  },
  {
    id: 'publish',
    title: 'Publish',
    description: 'Publish settings',
    status: 'pending'
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Final review & publish',
    status: 'pending'
  }
];

// Mobile-optimized steps
export const VEHICLE_ADDING_STEPS_MOBILE: Step[] = [
  {
    id: 'vehicle_type',
    title: 'Type',
    description: 'Used/New',
    status: 'pending'
  },
  {
    id: 'identify',
    title: 'Identify',
    description: 'Vehicle',
    status: 'pending'
  },
  {
    id: 'specs',
    title: 'Specs',
    description: 'Details',
    status: 'pending'
  },
  {
    id: 'condition',
    title: 'Condition',
    description: 'Status',
    status: 'pending'
  },
  {
    id: 'documents',
    title: 'Docs',
    description: 'Files',
    status: 'pending'
  },
  {
    id: 'media',
    title: 'Media',
    description: 'Photos',
    status: 'pending'
  },
  {
    id: 'pricing',
    title: 'Price',
    description: 'Cost',
    status: 'pending'
  },
  {
    id: 'publish',
    title: 'Publish',
    description: 'Settings',
    status: 'pending'
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Final',
    status: 'pending'
  }
];
