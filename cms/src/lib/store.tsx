import * as React from "react"
import {
  auditLog as initialAudit,
  bookings as initialBookings,
  clientPackages as initialPackages,
  clients as initialClients,
  defaultSettings,
  disciplines,
  packages as initialCatalog,
  sessions as initialSessions,
  users,
  NOW,
  type AuditEntry,
  type Booking,
  type ClassSession,
  type Client,
  type ClientPackage,
  type Method,
  type Package,
  type Role,
  type Settings,
} from "./data"

// Estado en memoria que simula el backend. En Laravel, cada acción es una
// ruta (POST/PATCH) y la página recibe los datos actualizados por Inertia.
interface State {
  role: Role
  sessions: ClassSession[]
  bookings: Booking[]
  clients: Client[]
  clientPackages: ClientPackage[]
  catalog: Package[]
  audit: AuditEntry[]
  settings: Settings
}

type Action =
  | { type: "setRole"; role: Role }
  | { type: "confirmPayment"; id: string; received: string; operation?: string }
  | { type: "voidPayment"; id: string; reason: string }
  | { type: "manualSale"; clientId: string; packageId: string; received: string; operation?: string }
  | { type: "setBookingStatus"; id: string; status: Booking["status"] }
  | { type: "cancelSession"; id: string; reason: string }
  | { type: "adjustCredits"; clientPackageId: string; delta: number; reason: string }
  | { type: "savePackage"; pkg: Package }
  | { type: "saveSettings"; settings: Settings }

const stamp = () => new Date(Date.parse(NOW) + Math.floor(Math.random() * 1000) * 1000).toISOString()

function reducer(s: State, a: Action): State {
  const me = users[s.role].name
  const log = (action: string, detail: string, reason?: string): AuditEntry[] => [
    { id: `a${s.audit.length + 1}-${Date.now()}`, at: stamp(), user: me, action, detail, reason },
    ...s.audit,
  ]
  const clientName = (id: string) => s.clients.find((c) => c.id === id)?.name ?? ""
  switch (a.type) {
    case "setRole":
      return { ...s, role: a.role }
    case "confirmPayment": {
      const cp = s.clientPackages.find((x) => x.id === a.id)!
      const pk = s.catalog.find((p) => p.id === cp.packageId)!
      const exp = new Date(Date.parse(NOW) + pk.validityDays * 864e5).toISOString().slice(0, 10)
      return {
        ...s,
        clientPackages: s.clientPackages.map((x) =>
          x.id === a.id ? { ...x, status: "active", activatedAt: stamp(), expiresOn: exp, confirmedBy: me, received: a.received, operation: a.operation, creditsUsed: x.heldSessionId ? 1 : 0 } : x
        ),
        // la clase guardada pasa a reservada y usa 1 crédito
        bookings: s.bookings.map((b) => (cp.heldSessionId && b.sessionId === cp.heldSessionId && b.clientId === cp.clientId && b.status === "held" ? { ...b, status: "booked" } : b)),
        audit: log("Pago confirmado", `${clientName(cp.clientId)} · ${pk.name} · ${a.received}${a.operation ? ` op. ${a.operation}` : ""}`),
      }
    }
    case "voidPayment": {
      const cp = s.clientPackages.find((x) => x.id === a.id)!
      const pk = s.catalog.find((p) => p.id === cp.packageId)!
      return {
        ...s,
        clientPackages: s.clientPackages.map((x) => (x.id === a.id ? { ...x, status: "void" } : x)),
        bookings: s.bookings.filter((b) => !(b.sessionId === cp.heldSessionId && b.clientId === cp.clientId && b.status === "held")),
        audit: log("Reserva de paquete anulada", `${clientName(cp.clientId)} · ${pk.name}`, a.reason),
      }
    }
    case "manualSale": {
      const pk = s.catalog.find((p) => p.id === a.packageId)!
      const exp = new Date(Date.parse(NOW) + pk.validityDays * 864e5).toISOString().slice(0, 10)
      const item: ClientPackage = {
        id: `cp${s.clientPackages.length + 1}-${Date.now()}`,
        clientId: a.clientId,
        packageId: pk.id,
        price: pk.price,
        method: a.received === "Efectivo" ? "cash" : ("whatsapp" as Method),
        status: "active",
        createdAt: stamp(),
        activatedAt: stamp(),
        expiresOn: exp,
        creditsTotal: pk.classes,
        creditsUsed: 0,
        confirmedBy: me,
        received: a.received,
        operation: a.operation,
      }
      return { ...s, clientPackages: [item, ...s.clientPackages], audit: log("Venta manual", `${clientName(a.clientId)} · ${pk.name} · S/ ${pk.price} · ${a.received}`) }
    }
    case "setBookingStatus":
      return { ...s, bookings: s.bookings.map((b) => (b.id === a.id ? { ...b, status: a.status } : b)) }
    case "cancelSession": {
      const ses = s.sessions.find((x) => x.id === a.id)!
      return {
        ...s,
        sessions: s.sessions.map((x) => (x.id === a.id ? { ...x, status: "cancelled" } : x)),
        bookings: s.bookings.map((b) => (b.sessionId === a.id && (b.status === "booked" || b.status === "held") ? { ...b, status: "cancelled_by_studio" } : b)),
        audit: log("Clase cancelada", `${ses.date} ${ses.time} · se devolvió 1 crédito a cada inscrita`, a.reason),
      }
    }
    case "adjustCredits": {
      const cp = s.clientPackages.find((x) => x.id === a.clientPackageId)!
      return {
        ...s,
        clientPackages: s.clientPackages.map((x) => (x.id === a.clientPackageId ? { ...x, creditsUsed: Math.max(0, x.creditsUsed - a.delta) } : x)),
        audit: log("Ajuste manual", `${clientName(cp.clientId)} · ${a.delta > 0 ? "+" : ""}${a.delta} crédito${Math.abs(a.delta) === 1 ? "" : "s"}`, a.reason),
      }
    }
    case "savePackage":
      return {
        ...s,
        catalog: s.catalog.some((p) => p.id === a.pkg.id) ? s.catalog.map((p) => (p.id === a.pkg.id ? a.pkg : p)) : [...s.catalog, a.pkg],
        audit: log("Paquete actualizado", `${a.pkg.name} · S/ ${a.pkg.price} · ${a.pkg.validityDays} días`),
      }
    case "saveSettings":
      return { ...s, settings: a.settings, audit: log("Reglas actualizadas", `Cancelación ${a.settings.cancelHours} h · reserva ${a.settings.bookingWindowDays} días · espera ${a.settings.waitlistOfferMinutes} min`) }
  }
}

const Ctx = React.createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, {
    role: "admin",
    sessions: initialSessions,
    bookings: initialBookings,
    clients: initialClients,
    clientPackages: initialPackages,
    catalog: initialCatalog,
    audit: initialAudit,
    settings: defaultSettings,
  })
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error("useStore fuera de StoreProvider")
  return v
}

// Selectores
export function useDerived() {
  const { state } = useStore()
  const discipline = (id: string) => initialDiscipline(id)
  const sessionTaken = (sessionId: string) =>
    state.bookings.filter((b) => b.sessionId === sessionId && !b.waitlistPosition && ["booked", "attended", "no_show", "held"].includes(b.status)).length
  const waitlist = (sessionId: string) => state.bookings.filter((b) => b.sessionId === sessionId && b.waitlistPosition && b.status === "booked").sort((a, b) => a.waitlistPosition! - b.waitlistPosition!)
  const activePackage = (clientId: string) => state.clientPackages.find((c) => c.clientId === clientId && c.status === "active")
  const credits = (cp?: ClientPackage) => (cp ? (cp.creditsTotal === null ? "Ilimitado" : `${cp.creditsTotal - cp.creditsUsed} de ${cp.creditsTotal}`) : "Sin paquete")
  return { discipline, sessionTaken, waitlist, activePackage, credits }
}

const initialDiscipline = (id: string) => disciplines.find((d) => d.id === id)!
