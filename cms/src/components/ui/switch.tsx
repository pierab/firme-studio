import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root className={cn("inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-taupe/60 p-0.5 transition-colors data-[state=checked]:bg-primary", className)} {...props}>
      <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-porcelana transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  )
}
