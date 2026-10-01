import * as React from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { CalendarDays, CreditCard, LayoutDashboard, Package, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { users, type Role } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster } from "@/components/ui/sonner"

export const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "reception", "instructor"] },
  { to: "/horarios", label: "Horarios", icon: CalendarDays, roles: ["admin", "reception", "instructor"] },
  { to: "/clientas", label: "Clientas", icon: Users, roles: ["admin", "reception"] },
  { to: "/ventas", label: "Ventas", icon: CreditCard, roles: ["admin", "reception"] },
  { to: "/paquetes", label: "Paquetes", icon: Package, roles: ["admin"] },
  { to: "/configuracion", label: "Configuración", icon: Settings, roles: ["admin"] },
] as const

export function canSee(role: Role, path: string) {
  const item = [...nav].sort((a, b) => b.to.length - a.to.length).find((n) => (n.to === "/" ? path === "/" : path.startsWith(n.to)))
  return !item || (item.roles as readonly string[]).includes(role)
}

export default function AppLayout() {
  const { state, dispatch } = useStore()
  const { pathname } = useLocation()
  const pending = state.clientPackages.filter((c) => c.status === "pending").length
  const items = nav.filter((n) => (n.roles as readonly string[]).includes(state.role))
  const allowed = canSee(state.role, pathname)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="flex flex-col gap-6 bg-sidebar px-4 py-5 lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center justify-between lg:block">
          <div>
            <img src="./logo.svg" alt="Firme Studio" className="h-9 w-auto" />
            <p className="mt-2 hidden text-[11px] text-muted-foreground lg:block">San Juan de Lurigancho · 1 sede</p>
          </div>
        </div>
        <nav aria-label="Panel interno" className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-[13px] transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-porcelana"
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              <span>{state.role === "instructor" && to === "/" ? "Mis clases" : label}</span>
              {to === "/ventas" && pending > 0 && (
                <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground" aria-label={`${pending} pagos pendientes`}>
                  {pending}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-3 border-t border-border pt-4 lg:block">
          <p className="text-[13px] font-medium">{users[state.role].name}</p>
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">Ver como (demo)</p>
            <Select value={state.role} onValueChange={(v) => dispatch({ type: "setRole", role: v as Role })}>
              <SelectTrigger className="h-9 bg-porcelana text-[13px]" aria-label="Cambiar rol">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administradora</SelectItem>
                <SelectItem value="reception">Recepción</SelectItem>
                <SelectItem value="instructor">Instructora</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-5 py-6 lg:px-10 lg:py-8">
        <div className="mb-4 flex items-center gap-3 lg:hidden">
          <span className="text-[11px] text-muted-foreground">Ver como</span>
          <Select value={state.role} onValueChange={(v) => dispatch({ type: "setRole", role: v as Role })}>
            <SelectTrigger className="h-8 w-44 text-[12px]" aria-label="Cambiar rol">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administradora</SelectItem>
              <SelectItem value="reception">Recepción</SelectItem>
              <SelectItem value="instructor">Instructora</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {allowed ? (
          <Outlet />
        ) : (
          <div className="max-w-md space-y-3 py-20">
            <h1 className="font-serif text-4xl">Sin acceso</h1>
            <p className="text-sm text-muted-foreground">Tu rol de {users[state.role].roleLabel} no puede ver esta sección.</p>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[40px] leading-tight font-normal">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function Stat({ label, value, hint, dark }: { label: string; value: string; hint?: string; dark?: boolean }) {
  return (
    <div className={cn("rounded-md border p-5", dark ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white/70")}>
      <p className={cn("text-[12px]", dark ? "text-porcelana/80" : "text-muted-foreground")}>{label}</p>
      <p className="mt-3 font-serif text-[34px] leading-none">{value}</p>
      {hint && <p className={cn("mt-3 text-[12px]", dark ? "text-porcelana/80" : "text-muted-foreground")}>{hint}</p>}
    </div>
  )
}
