## cn utility

Source: `src/lib/utils.ts`

Merges class names using `clsx` and `tailwind-merge`.

### Example
```ts
import { cn } from '@/lib/utils';

<div className={cn('p-2', condition && 'bg-red-500')}/>
```