"use client"

import * as React from "react"
import { cn } from "@/lib/utils"



const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    // We need to access the context from Tabs, but for this simple implementation w/o Context,
    // we rely on the parent cloning. However, deeply nested triggers won't work.
    // For a robust solution without Radix, Context is better.
    // But for this flat structure it might work if we just use Context.
    
    // Let's switch to Context for reliability.
    return (
        <TabsContext.Consumer>
            {({ currentValue, onChange }) => (
                 <button
                    ref={ref}
                    type="button"
                    onClick={() => onChange?.(value)}
                    className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    currentValue === value
                        ? "bg-background text-foreground shadow-sm"
                        : "hover:bg-background/50 hover:text-foreground",
                    className
                    )}
                    {...props}
                />
            )}
        </TabsContext.Consumer>
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
     return (
        <TabsContext.Consumer>
             {({ currentValue }) => {
                 if (currentValue !== value) return null
                 return (
                    <div
                        ref={ref}
                        className={cn(
                        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        className
                        )}
                        {...props}
                    />
                 )
             }}
        </TabsContext.Consumer>
    )
})
TabsContent.displayName = "TabsContent"

// Simple Context
const TabsContext = React.createContext<{ currentValue?: string, onChange?: (v: string) => void }>({})

// Re-implement Root with Context
const TabsRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value: controlledValue, defaultValue, onValueChange, children, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  
  const value = controlledValue !== undefined ? controlledValue : internalValue
  
  const handleValueChange = (newValue: string) => {
      onValueChange?.(newValue)
      if (controlledValue === undefined) {
          setInternalValue(newValue)
      }
  }

  return (
    <TabsContext.Provider value={{ currentValue: value, onChange: handleValueChange }}>
        <div ref={ref} className={cn("", className)} {...props}>
            {children}
        </div>
    </TabsContext.Provider>
  )
})
TabsRoot.displayName = "Tabs"

export { TabsRoot as Tabs, TabsList, TabsTrigger, TabsContent }
