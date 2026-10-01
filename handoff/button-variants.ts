/**
 * Firme Studio — variantes del Button de shadcn/ui según los componentes de Figma
 * (Botón / Primario, Secundario, Claro, Link).
 * Uso: reemplazar `buttonVariants` en resources/js/components/ui/button.tsx.
 */
import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  // Base: píldora, Label/Button (Montserrat 500 · 13 px · tracking 16 % · mayúsculas)
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full text-label-button transition-opacity hover:opacity-85 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Botón / Primario: fondo espresso, texto porcelana
        default: "bg-primary text-primary-foreground border border-primary",
        // Botón / Secundario: borde espresso, fondo transparente
        outline: "border border-primary bg-transparent text-foreground",
        // Botón / Claro: sobre fondos oscuros (CTA final, footer)
        light: "bg-porcelana text-espresso border border-porcelana",
        // Botón / Link: texto con subrayado inferior en color línea
        link: "rounded-none px-0 pb-1.5 border-b border-border text-foreground",
        // Acciones destructivas del panel (cancelar clase)
        destructive: "bg-destructive text-primary-foreground border border-destructive",
        // Acciones discretas del panel
        ghost: "bg-transparent text-foreground hover:bg-muted hover:opacity-100",
      },
      size: {
        // Figma: 18 px vertical · 32 px horizontal · alto ≈ 50 px
        default: "h-[50px] px-8",
        // Nav y tarjetas compactas
        sm: "h-11 px-5",
        // Móvil: alto mínimo 48 px para área táctil
        lg: "h-12 px-6",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
