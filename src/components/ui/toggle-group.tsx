"use client";
import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

type ToggleSize = Parameters<typeof toggleVariants>[0] extends { size?: infer S } ? NonNullable<S> : "default"
type ToggleVariant = Parameters<typeof toggleVariants>[0] extends { variant?: infer V } ? NonNullable<V> : "default"

type ToggleGroupCtx = {
  size?: ToggleSize
  variant?: ToggleVariant
}

const ToggleGroupContext = React.createContext<ToggleGroupCtx>({
  size: "default",
  variant: "default",
})

type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
  className?: string
  variant?: ToggleVariant
  size?: ToggleSize
  children?: React.ReactNode
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}>
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

type ToggleGroupItemProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & {
  className?: string
  variant?: ToggleVariant
  size?: ToggleSize
  children?: React.ReactNode
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    (<ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(toggleVariants({
        variant: context.variant || variant,
        size: context.size || size,
      }), className)}
      {...props}>
      {children}
    </ToggleGroupPrimitive.Item>)
  );
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
