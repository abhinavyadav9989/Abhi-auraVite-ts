## State Transition Manager

Source: `src/components/data/StateTransitionManager.tsx`

### Exports
- `DEALER_STATE_MACHINE`, `TRANSACTION_STATE_MACHINE`
- `validateDealerStatusTransition(current, next)`
- `validateTransactionStatusTransition(current, next)`
- `getAvailableTransitions(stateMachine, currentState)`
- `useStateTransition(entityType, currentStatus)`
- Default component `StateTransitionValidator`

### Example
```ts
import { useStateTransition, DEALER_STATE_MACHINE, getAvailableTransitions } from '@/components/data/StateTransitionManager';

const { availableTransitions, canTransitionTo, validateTransition } = useStateTransition('dealer', 'pending');

if (canTransitionTo('documents_submitted')) {
  // proceed
}
```

### UI Validator
```tsx
import StateTransitionValidator from '@/components/data/StateTransitionManager';

<StateTransitionValidator entityType="dealer" currentStatus="pending" proposedStatus="verified" showValidation />
```