import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: { background: "var(--espresso)", color: "var(--porcelana)", border: "none", fontFamily: "var(--font-sans)", fontSize: 13 },
      }}
    />
  )
}
