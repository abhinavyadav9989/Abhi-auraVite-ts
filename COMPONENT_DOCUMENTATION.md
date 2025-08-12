# Base44 UI Components Documentation

## Table of Contents

1. [Overview](#overview)
2. [Layout Components](#layout-components)
3. [Form Components](#form-components)
4. [Navigation Components](#navigation-components)
5. [Data Display Components](#data-display-components)
6. [Feedback Components](#feedback-components)
7. [Overlay Components](#overlay-components)
8. [Utility Components](#utility-components)

## Overview

The Base44 application uses a comprehensive set of UI components built on top of Radix UI primitives and styled with Tailwind CSS. All components follow the shadcn/ui design system and are fully accessible.

## Layout Components

### Card

A flexible container component for displaying content in a structured layout.

#### Import
```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes |
| `children` | `ReactNode` | Card content |

#### Usage
```typescript
<Card>
  <CardHeader>
    <CardTitle>Vehicle Details</CardTitle>
    <CardDescription>Complete information about the vehicle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Vehicle information goes here</p>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

### Separator

A visual separator component for dividing content sections.

#### Import
```typescript
import { Separator } from '@/components/ui/separator';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Separator orientation |
| `className` | `string` | - | Additional CSS classes |

#### Usage
```typescript
<div>
  <h2>Section 1</h2>
  <Separator className="my-4" />
  <h2>Section 2</h2>
</div>
```

### Aspect Ratio

Maintains aspect ratio for responsive content.

#### Import
```typescript
import { AspectRatio } from '@/components/ui/aspect-ratio';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ratio` | `number` | `16/9` | Aspect ratio (width/height) |
| `className` | `string` | - | Additional CSS classes |

#### Usage
```typescript
<AspectRatio ratio={16/9}>
  <img src="/vehicle-image.jpg" alt="Vehicle" />
</AspectRatio>
```

## Form Components

### Form

A form component built with React Hook Form and Zod validation.

#### Import
```typescript
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
```

#### Usage
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Enter your email" />
              </FormControl>
              <FormDescription>
                We'll never share your email with anyone else.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Sign In</Button>
      </form>
    </Form>
  );
}
```

### Input

A versatile input component with various types and states.

#### Import
```typescript
import { Input } from '@/components/ui/input';
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `type` | `string` | Input type (text, email, password, etc.) |
| `placeholder` | `string` | Placeholder text |
| `disabled` | `boolean` | Disabled state |
| `className` | `string` | Additional CSS classes |

#### Usage
```typescript
<Input 
  type="email" 
  placeholder="Enter your email"
  className="w-full"
/>
```

### Textarea

A multi-line text input component.

#### Import
```typescript
import { Textarea } from '@/components/ui/textarea';
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `placeholder` | `string` | Placeholder text |
| `rows` | `number` | Number of visible rows |
| `disabled` | `boolean` | Disabled state |
| `className` | `string` | Additional CSS classes |

#### Usage
```typescript
<Textarea 
  placeholder="Enter vehicle description"
  rows={4}
  className="w-full"
/>
```

### Select

A select dropdown component with search functionality.

#### Import
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
```

#### Usage
```typescript
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a vehicle type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="sedan">Sedan</SelectItem>
    <SelectItem value="suv">SUV</SelectItem>
    <SelectItem value="hatchback">Hatchback</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox

A checkbox input component.

#### Import
```typescript
import { Checkbox } from '@/components/ui/checkbox';
```

#### Usage
```typescript
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms">I agree to the terms and conditions</label>
</div>
```

### Radio Group

A group of radio button inputs.

#### Import
```typescript
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
```

#### Usage
```typescript
<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <label htmlFor="option-one">Option One</label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <label htmlFor="option-two">Option Two</label>
  </div>
</RadioGroup>
```

### Switch

A toggle switch component.

#### Import
```typescript
import { Switch } from '@/components/ui/switch';
```

#### Usage
```typescript
<div className="flex items-center space-x-2">
  <Switch id="air-mode" />
  <label htmlFor="air-mode">Airplane mode</label>
</div>
```

### Slider

A range slider component.

#### Import
```typescript
import { Slider } from '@/components/ui/slider';
```

#### Usage
```typescript
<Slider
  defaultValue={[33]}
  max={100}
  step={1}
  className="w-[60%]"
/>
```

## Navigation Components

### Navigation Menu

A horizontal navigation menu with dropdown support.

#### Import
```typescript
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
```

#### Usage
```typescript
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Inventory</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-[.75fr_1fr]">
          <li className="row-span-3">
            <NavigationMenuLink asChild>
              <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                <div className="mb-2 mt-4 text-lg font-medium">
                  Vehicle Management
                </div>
                <p className="text-sm leading-tight text-muted-foreground">
                  Manage your vehicle inventory efficiently.
                </p>
              </a>
            </NavigationMenuLink>
          </li>
          <ListItem href="/add-vehicle" title="Add Vehicle">
            Add a new vehicle to your inventory
          </ListItem>
          <ListItem href="/edit-vehicle" title="Edit Vehicle">
            Modify existing vehicle details
          </ListItem>
          <ListItem href="/bulk-import" title="Bulk Import">
            Import multiple vehicles at once
          </ListItem>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Breadcrumb

A breadcrumb navigation component.

#### Import
```typescript
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
```

#### Usage
```typescript
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/inventory">Inventory</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Vehicle Details</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Menubar

A horizontal menu bar component.

#### Import
```typescript
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from '@/components/ui/menubar';
```

#### Usage
```typescript
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New Vehicle <MenubarShortcut>⌘N</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>Open</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Exit</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

## Data Display Components

### Table

A data table component with sorting and pagination.

#### Import
```typescript
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
```

#### Usage
```typescript
<Table>
  <TableCaption>A list of your vehicles.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Make</TableHead>
      <TableHead>Model</TableHead>
      <TableHead>Year</TableHead>
      <TableHead>Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {vehicles.map((vehicle) => (
      <TableRow key={vehicle.id}>
        <TableCell>{vehicle.make}</TableCell>
        <TableCell>{vehicle.model}</TableCell>
        <TableCell>{vehicle.year}</TableCell>
        <TableCell>{formatCurrency(vehicle.price)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Badge

A small badge component for status indicators.

#### Import
```typescript
import { Badge } from '@/components/ui/badge';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'secondary' \| 'destructive' \| 'outline'` | `'default'` | Badge variant |

#### Usage
```typescript
<Badge variant="outline">Available</Badge>
<Badge variant="destructive">Sold</Badge>
<Badge variant="secondary">Pending</Badge>
```

### Avatar

An avatar component for user profile pictures.

#### Import
```typescript
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
```

#### Usage
```typescript
<Avatar>
  <AvatarImage src="/user-avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Progress

A progress bar component.

#### Import
```typescript
import { Progress } from '@/components/ui/progress';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Progress value (0-100) |
| `className` | `string` | - | Additional CSS classes |

#### Usage
```typescript
<Progress value={33} className="w-[60%]" />
```

### Calendar

A calendar component for date selection.

#### Import
```typescript
import { Calendar } from '@/components/ui/calendar';
```

#### Usage
```typescript
import { useState } from 'react';
import { format } from 'date-fns';

function DatePicker() {
  const [date, setDate] = useState<Date>();

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
}
```

## Feedback Components

### Alert

An alert component for displaying important messages.

#### Import
```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'destructive'` | `'default'` | Alert variant |

#### Usage
```typescript
<Alert>
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your vehicle has been successfully added to the inventory.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    There was an error processing your request.
  </AlertDescription>
</Alert>
```

### Toast

A toast notification component.

#### Import
```typescript
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
```

#### Usage
```typescript
function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Vehicle added successfully",
    });
  };

  const handleError = () => {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to add vehicle",
    });
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
      <Toaster />
    </div>
  );
}
```

### Skeleton

A skeleton loading component.

#### Import
```typescript
import { Skeleton } from '@/components/ui/skeleton';
```

#### Usage
```typescript
<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-4 w-[300px]" />
</div>
```

## Overlay Components

### Dialog

A modal dialog component.

#### Import
```typescript
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
```

#### Usage
```typescript
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Form content */}
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Sheet

A slide-out panel component.

#### Import
```typescript
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | Sheet side |

#### Usage
```typescript
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Sidebar</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here. Click save when you're done.
      </SheetDescription>
    </SheetHeader>
    <div className="grid gap-4 py-4">
      {/* Content */}
    </div>
  </SheetContent>
</Sheet>
```

### Popover

A popover component for contextual information.

#### Import
```typescript
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
```

#### Usage
```typescript
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Dimensions</h4>
        <p className="text-sm text-muted-foreground">
          Set the dimensions for the layer.
        </p>
      </div>
      <div className="grid gap-2">
        {/* Content */}
      </div>
    </div>
  </PopoverContent>
</Popover>
```

### Hover Card

A hover card component for additional information.

#### Import
```typescript
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
```

#### Usage
```typescript
<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@nextjs</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex justify-between space-x-4">
      <Avatar>
        <AvatarImage src="https://github.com/vercel.png" />
        <AvatarFallback>VC</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">@nextjs</h4>
        <p className="text-sm">
          The React Framework – created and maintained by @vercel.
        </p>
        <div className="flex items-center pt-2">
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          <span className="text-xs text-muted-foreground">
            Joined December 2021
          </span>
        </div>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

### Tooltip

A tooltip component for additional context.

#### Import
```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
```

#### Usage
```typescript
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Utility Components

### Command

A command palette component for search and navigation.

#### Import
```typescript
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
```

#### Usage
```typescript
<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem>Profile</CommandItem>
      <CommandItem>Billing</CommandItem>
      <CommandItem>Settings</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

### Toggle

A toggle button component.

#### Import
```typescript
import { Toggle } from '@/components/ui/toggle';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pressed` | `boolean` | - | Pressed state |
| `onPressedChange` | `(pressed: boolean) => void` | - | Pressed change handler |
| `size` | `'default' \| 'sm' \| 'lg'` | `'default'` | Toggle size |

#### Usage
```typescript
<Toggle aria-label="Toggle italic">
  <Bold className="h-4 w-4" />
</Toggle>
```

### Toggle Group

A group of toggle buttons.

#### Import
```typescript
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
```

#### Usage
```typescript
<ToggleGroup type="single">
  <ToggleGroupItem value="bold" aria-label="Toggle bold">
    <Bold className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Toggle italic">
    <Italic className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
    <Strikethrough className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

### Collapsible

A collapsible content component.

#### Import
```typescript
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
```

#### Usage
```typescript
<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" size="sm">
      <ChevronDown className="h-4 w-4" />
      <span>Show more</span>
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="space-y-2">
    <div className="rounded-md border px-4 py-3 font-mono text-sm">
      @radix-ui/react-collapsible
    </div>
    <div className="rounded-md border px-4 py-3 font-mono text-sm">
      @radix-ui/react-slot
    </div>
  </CollapsibleContent>
</Collapsible>
```

### Accordion

An accordion component for collapsible sections.

#### Import
```typescript
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
```

#### Usage
```typescript
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles that matches the other
      components&apos; aesthetic.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Resizable

A resizable panel component.

#### Import
```typescript
import { Resizable } from '@/components/ui/resizable';
```

#### Usage
```typescript
<Resizable
  defaultSize={{ width: 200, height: 200 }}
  minWidth={100}
  minHeight={100}
  maxWidth={400}
  maxHeight={400}
  className="bg-gray-200"
>
  <div className="p-4">
    <h3>Resizable Panel</h3>
    <p>
      This panel can be resized by dragging the edges or corners.
    </p>
  </div>
</Resizable>
```