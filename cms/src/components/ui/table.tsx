import * as React from "react"
import { cn } from "@/lib/utils"

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-border">
      <table className={cn("w-full min-w-[640px] caption-bottom text-[13px]", className)} {...props} />
    </div>
  )
}
export function TableHeader(props: React.ComponentProps<"thead">) {
  return <thead className="bg-arena" {...props} />
}
export function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody className="bg-white/60 [&_tr:last-child]:border-0" {...props} />
}
export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("border-b border-border transition-colors hover:bg-porcelana", className)} {...props} />
}
export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("h-10 px-3 text-left align-middle text-[11px] font-medium uppercase tracking-[0.12em] text-foreground", className)} {...props} />
}
export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-3 py-3 align-middle", className)} {...props} />
}
