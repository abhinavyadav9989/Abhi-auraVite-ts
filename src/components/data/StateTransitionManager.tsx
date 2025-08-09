import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// Define state machines
export const DEALER_STATE_MACHINE = {
  onboarding_draft: ['pending', 'documents_required'],
  pending: ['documents_required', 'documents_submitted', 'rejected'],
  documents_required: ['documents_submitted', 'rejected'],
  documents_submitted: ['verified', 'rejected', 'provisional'],
  provisional: ['verified', 'rejected', 'suspended'],
  verified: ['suspended'],
  rejected: ['pending', 'documents_required'],
  suspended: ['verified', 'rejected']
};

export const TRANSACTION_STATE_MACHINE = {
  offer_made: ['negotiating', 'accepted', 'rejected', 'expired'],
  negotiating: ['accepted', 'rejected', 'expired'],
  accepted: ['payment_pending', 'cancelled'],
  payment_pending: ['paid', 'payment_timeout', 'cancelled'],
  paid: ['picked_up', 'cancelled', 'disputed'],
  picked_up: ['in_transit', 'disputed'],
  in_transit: ['delivered', 'disputed'],
  delivered: ['rto_done', 'disputed'],
  rto_done: ['completed', 'disputed'],
  completed: ['archived'],
  cancelled: ['archived'],
  disputed: ['resolved', 'cancelled', 'completed'],
  payment_timeout: ['cancelled', 'payment_pending'],
  expired: ['archived'],
  archived: []
};

// Validation functions
export const validateDealerStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = DEALER_STATE_MACHINE[currentStatus] || [];
  return {
    isValid: allowedTransitions.includes(newStatus),
    allowedTransitions,
    message: allowedTransitions.includes(newStatus) 
      ? `Valid transition from ${currentStatus} to ${newStatus}`
      : `Invalid transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(', ')}`
  };
};

export const validateTransactionStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = TRANSACTION_STATE_MACHINE[currentStatus] || [];
  return {
    isValid: allowedTransitions.includes(newStatus),
    allowedTransitions,
    message: allowedTransitions.includes(newStatus)
      ? `Valid transition from ${currentStatus} to ${newStatus}`
      : `Invalid transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(', ')}`
  };
};

// Get all possible next states for a given current state
export const getAvailableTransitions = (stateMachine, currentState) => {
  return stateMachine[currentState] || [];
};

// Hook for managing state transitions
export const useStateTransition = (entityType, currentStatus) => {
  const stateMachine = entityType === 'dealer' ? DEALER_STATE_MACHINE : TRANSACTION_STATE_MACHINE;
  const availableTransitions = getAvailableTransitions(stateMachine, currentStatus);
  
  const canTransitionTo = (newStatus) => {
    return availableTransitions.includes(newStatus);
  };
  
  const validateTransition = (newStatus) => {
    return entityType === 'dealer'
      ? validateDealerStatusTransition(currentStatus, newStatus)
      : validateTransactionStatusTransition(currentStatus, newStatus);
  };
  
  return {
    availableTransitions,
    canTransitionTo,
    validateTransition,
    currentStatus
  };
};

// State Machine Validator Component
export default function StateTransitionValidator({ 
  entityType, 
  currentStatus, 
  proposedStatus, 
  showValidation = false 
}) {
  const validation = entityType === 'dealer' 
    ? validateDealerStatusTransition(currentStatus, proposedStatus)
    : validateTransactionStatusTransition(currentStatus, proposedStatus);
  
  if (!showValidation) return null;
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded text-sm ${
      validation.isValid 
        ? 'bg-green-50 text-green-700 border border-green-200' 
        : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {validation.isValid ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertTriangle className="w-4 h-4" />
      )}
      <span>{validation.message}</span>
    </div>
  );
}