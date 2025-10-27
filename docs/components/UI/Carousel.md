## Carousel

Source: `src/components/ui/carousel.tsx`

### Exports
- `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`

### Example
```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

<Carousel className="w-full">
  <CarouselContent>
    <CarouselItem className="basis-auto">Slide 1</CarouselItem>
    <CarouselItem className="basis-auto">Slide 2</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```