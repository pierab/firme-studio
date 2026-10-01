import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("rounded-md border border-border bg-white/70 text-card-foreground", className)} {...props} />
}
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)} {...props} />
}
export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("font-sans text-[15px] font-medium text-foreground", className)} {...props} />
}
export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-[13px] text-muted-foreground", className)} {...props} />
}
export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 py-5", className)} {...props} />
}
