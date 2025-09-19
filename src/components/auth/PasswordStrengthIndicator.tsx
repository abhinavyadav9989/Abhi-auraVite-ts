import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

// Move requirements outside component to avoid dependency issues
const passwordRequirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (pwd) => pwd.length >= 8,
    met: false
  },
  {
    label: 'One uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd),
    met: false
  },
  {
    label: 'One lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd),
    met: false
  },
  {
    label: 'One number',
    test: (pwd) => /\d/.test(pwd),
    met: false
  },
  {
    label: 'One special character',
    test: (pwd) => /[@$!%*?&]/.test(pwd),
    met: false
  }
];

export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([]);

  useEffect(() => {
    const updatedRequirements = passwordRequirements.map(req => ({
      ...req,
      met: req.test(password)
    }));
    setRequirements(updatedRequirements);
  }, [password]);

  const allRequirementsMet = requirements.length > 0 && requirements.every(req => req.met);
  const strengthScore = requirements.filter(req => req.met).length;
  const strengthLevel = strengthScore <= 2 ? 'weak' : strengthScore <= 3 ? 'medium' : 'strong';

  const getStrengthColor = () => {
    switch (strengthLevel) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getStrengthBgColor = () => {
    switch (strengthLevel) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Password Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Password strength:</span>
          <span className={`font-medium capitalize ${getStrengthColor()}`}>
            {strengthLevel}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getStrengthBgColor()}`}
            style={{ width: `${(strengthScore / requirements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            {requirement.met ? (
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-red-500 flex-shrink-0" />
            )}
            <span className={requirement.met ? 'text-green-700' : 'text-red-700'}>
              {requirement.label}
            </span>
          </div>
        ))}
      </div>

      {/* Overall Status */}
      {allRequirementsMet && (
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
          <Check className="h-4 w-4" />
          <span className="font-medium">Password meets all requirements</span>
        </div>
      )}
    </div>
  );
}

// Export validation function for use in forms
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
