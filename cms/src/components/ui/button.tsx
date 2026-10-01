import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Variantes según los botones de Figma (ver handoff/button-variants.ts).
// En el panel se usa un tamaño más compacto que en la web pública.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[11px] font-medium uppercase tracking-[0.14em] transition-opacity hover:opacity-85 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border border-primary",
        outline: "border border-primary bg-transparent text-foreground",
        light: "bg-porcelana text-espresso border border-porcelana",
        destructive: "bg-destructive text-primary-foreground border border-destructive",
        ghost: "bg-transparent text-foreground hover:bg-muted hover:opacity-100",
        link: "rounded-none px-0 normal-case tracking-normal text-[13px] text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-4",
        lg: "h-12 px-7",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
