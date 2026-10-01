import * as React from "react"
import { cn } from "@/lib/utils"

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-input bg-white/80 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn("min-h-20 w-full rounded-md border border-input bg-white/80 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring", className)}
      {...props}
    />
  )
}
