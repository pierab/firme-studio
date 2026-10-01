// Datos de ejemplo del panel interno de Firme Studio.
// Los tipos siguen las entidades del handoff (Discipline, ClassSession, Booking,
// ClientPackage, CreditMovement, AuditLog, Setting). En Laravel vendrán como props
// de Inertia; aquí se simulan en memoria.

export type Role = "admin" | "reception" | "instructor"
export type Method = "whatsapp" | "cash"

export interface Discipline { id: string; name: string; minutes: number; level: string; capacity: number }
export interface Instructor { id: string; name: string; disciplines: string[] }
export interface ClassSession {
  id: string
  disciplineId: string
  instructorId: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  capacity: number
  status: "scheduled" | "cancelled"
}
export interface Client { id: string; name: string; dni: string; phone: string; email: string; since: string; notes?: string }
export interface Package { id: string; name: string; classes: number | null; price: number; validityDays: number; featured: boolean; active: boolean; trial: boolean }
export interface ClientPackage {
  id: string
  clientId: string
  packageId: string
  price: number
  method: Method
  status: "pending" | "active" | "expired" | "void"
  createdAt: string // ISO
  activatedAt?: string
  expiresOn?: string
  creditsTotal: number | null
  creditsUsed: number
  confirmedBy?: string
  operation?: string
  received?: string // Yape, Plin, Transferencia, Efectivo
  heldSessionId?: string // clase guardada mientras se confirma el pago
}
export interface Booking {
  id: string
  sessionId: string
  clientId: string
  status: "booked" | "attended" | "no_show" | "cancelled_on_time" | "cancelled_late" | "cancelled_by_studio" | "held"
  waitlistPosition?: number
}
export interface AuditEntry { id: string; at: string; user: string; action: string; detail: string; reason?: string }
export interface Settings {
  cancelHours: number
  bookingWindowDays: number
  lateToleranceMinutes: number
  waitlistOfferMinutes: number
  reminderHours: number[]
  heldClassHoursBefore: number
  openingBanner: boolean
}

export const TODAY = "2026-10-05" // lunes de apertura
export const NOW = "2026-10-05T10:20:00-05:00"

export const users: Record<Role, { name: string; roleLabel: string }> = {
  admin: { name: "María Torres", roleLabel: "Administradora" },
  reception: { name: "Laura Méndez", roleLabel: "Recepción" },
  instructor: { name: "Lucía Mendoza", roleLabel: "Instructora" },
}

export const disciplines: Discipline[] = [
  { id: "reformer", name: "Reformer", minutes: 50, level: "Todos los niveles", capacity: 8 },
  { id: "barre", name: "Barre", minutes: 50, level: "Todos los niveles", capacity: 12 },
  { id: "hot", name: "Hot", minutes: 50, level: "Intermedio", capacity: 8 },
  { id: "mat", name: "Mat", minutes: 50, level: "Todos los niveles", capacity: 12 },
  { id: "dance", name: "Dance", minutes: 50, level: "Todos los niveles", capacity: 15 },
]

export const instructors: Instructor[] = [
  { id: "camila", name: "Camila Rojas", disciplines: ["reformer", "barre"] },
  { id: "valeria", name: "Valeria Paredes", disciplines: ["barre", "hot"] },
  { id: "lucia", name: "Lucía Mendoza", disciplines: ["mat", "dance"] },
]
export const INSTRUCTOR_SELF = "lucia"

const week: [string, string, string, string][] = [
  // fecha, hora, disciplina, instructora
  ["2026-10-05", "08:00", "reformer", "camila"], ["2026-10-05", "09:30", "barre", "valeria"], ["2026-10-05", "12:00", "mat", "lucia"], ["2026-10-05", "17:00", "hot", "valeria"], ["2026-10-05", "18:30", "dance", "lucia"],
  ["2026-10-06", "08:00", "barre", "valeria"], ["2026-10-06", "10:00", "reformer", "camila"], ["2026-10-06", "16:30", "dance", "lucia"], ["2026-10-06", "17:00", "hot", "valeria"],
  ["2026-10-07", "08:00", "reformer", "camila"], ["2026-10-07", "09:30", "hot", "valeria"], ["2026-10-07", "12:00", "mat", "lucia"], ["2026-10-07", "17:00", "reformer", "camila"],
  ["2026-10-08", "08:00", "barre", "camila"], ["2026-10-08", "10:00", "mat", "lucia"], ["2026-10-08", "16:30", "reformer", "camila"], ["2026-10-08", "17:00", "dance", "lucia"],
  ["2026-10-09", "08:00", "reformer", "camila"], ["2026-10-09", "09:30", "barre", "valeria"], ["2026-10-09", "17:00", "hot", "valeria"],
  ["2026-10-10", "08:00", "reformer", "camila"], ["2026-10-10", "09:30", "barre", "valeria"], ["2026-10-10", "11:00", "dance", "lucia"],
  ["2026-10-11", "09:00", "mat", "lucia"], ["2026-10-11", "10:30", "reformer", "camila"],
]

export const sessions: ClassSession[] = week.map(([date, time, d, i], n) => ({
  id: `s${n + 1}`,
  disciplineId: d,
  instructorId: i,
  date,
  time,
  capacity: disciplines.find((x) => x.id === d)!.capacity,
  status: "scheduled",
}))

export const clients: Client[] = [
  { id: "c1", name: "Ana Salazar", dni: "45678912", phone: "+51 987 654 321", email: "ana@correo.com", since: "2026-10-01" },
  { id: "c2", name: "María Vega", dni: "47112233", phone: "+51 955 120 448", email: "maria.vega@correo.com", since: "2026-10-01" },
  { id: "c3", name: "Lucía Ramos", dni: "72514409", phone: "+51 944 301 776", email: "lucia.r@correo.com", since: "2026-10-02" },
  { id: "c4", name: "Carla Ruiz", dni: "46009871", phone: "+51 991 455 210", email: "carla.ruiz@correo.com", since: "2026-10-02", notes: "Lesión de rodilla izquierda (2025). Evitar saltos." },
  { id: "c5", name: "Rosa Díaz", dni: "70456123", phone: "+51 962 870 114", email: "rosa.diaz@correo.com", since: "2026-10-02" },
  { id: "c6", name: "Sofía Castro", dni: "74120098", phone: "+51 958 330 902", email: "sofia.c@correo.com", since: "2026-10-03" },
  { id: "c7", name: "Paula León", dni: "71889034", phone: "+51 987 112 660", email: "paula.leon@correo.com", since: "2026-10-03" },
  { id: "c8", name: "Valentina Ríos", dni: "73300451", phone: "+51 946 778 213", email: "vale.rios@correo.com", since: "2026-10-03" },
  { id: "c9", name: "Daniela Flores", dni: "48120967", phone: "+51 993 004 512", email: "dani.flores@correo.com", since: "2026-10-04" },
  { id: "c10", name: "Camila Torres", dni: "75010233", phone: "+51 940 662 781", email: "cami.torres@correo.com", since: "2026-10-04" },
  { id: "c11", name: "Fernanda Quispe", dni: "70998123", phone: "+51 951 220 004", email: "fer.quispe@correo.com", since: "2026-10-04" },
  { id: "c12", name: "Gabriela Huamán", dni: "46551209", phone: "+51 977 401 333", email: "gaby.h@correo.com", since: "2026-10-04" },
]

// Precios y vigencias de ejemplo (pendientes de confirmar con el estudio)
export const packages: Package[] = [
  { id: "p-trial", name: "Clase de prueba", classes: 1, price: 49, validityDays: 15, featured: false, active: true, trial: true },
  { id: "p1", name: "1 clase", classes: 1, price: 69, validityDays: 30, featured: false, active: true, trial: false },
  { id: "p4", name: "4 clases", classes: 4, price: 260, validityDays: 60, featured: false, active: true, trial: false },
  { id: "p8", name: "8 clases", classes: 8, price: 512, validityDays: 90, featured: true, active: true, trial: false },
  { id: "p12", name: "12 clases", classes: 12, price: 756, validityDays: 120, featured: false, active: true, trial: false },
  { id: "p20", name: "20 clases", classes: 20, price: 1240, validityDays: 180, featured: false, active: true, trial: false },
  { id: "p40", name: "40 clases", classes: 40, price: 2400, validityDays: 180, featured: false, active: false, trial: false },
  { id: "pU", name: "Ilimitado mensual", classes: null, price: 1000, validityDays: 30, featured: false, active: false, trial: false },
]

const cp = (o: Partial<ClientPackage> & Pick<ClientPackage, "id" | "clientId" | "packageId" | "method" | "status" | "createdAt">): ClientPackage => {
  const pk = packages.find((p) => p.id === o.packageId)!
  return { price: pk.price, creditsTotal: pk.classes, creditsUsed: 0, ...o }
}

export const clientPackages: ClientPackage[] = [
  // Pendientes de confirmar (bandeja de Pagos pendientes)
  cp({ id: "cp1", clientId: "c1", packageId: "p8", method: "whatsapp", status: "pending", createdAt: "2026-10-05T05:10:00-05:00", heldSessionId: "s6" }),
  cp({ id: "cp2", clientId: "c2", packageId: "p4", method: "cash", status: "pending", createdAt: "2026-10-05T08:15:00-05:00", heldSessionId: "s13" }),
  cp({ id: "cp3", clientId: "c3", packageId: "p-trial", method: "whatsapp", status: "pending", createdAt: "2026-10-05T09:40:00-05:00" }),
  // Activos
  cp({ id: "cp4", clientId: "c4", packageId: "p8", method: "whatsapp", status: "active", createdAt: "2026-10-02T11:00:00-05:00", activatedAt: "2026-10-02T11:15:00-05:00", expiresOn: "2026-12-31", creditsUsed: 2, confirmedBy: "Laura Méndez", received: "Yape", operation: "983124" }),
  cp({ id: "cp5", clientId: "c5", packageId: "p12", method: "whatsapp", status: "active", createdAt: "2026-10-02T12:00:00-05:00", activatedAt: "2026-10-02T12:05:00-05:00", expiresOn: "2027-01-30", creditsUsed: 1, confirmedBy: "María Torres", received: "Plin", operation: "551207" }),
  cp({ id: "cp6", clientId: "c6", packageId: "p4", method: "cash", status: "active", createdAt: "2026-10-03T10:40:00-05:00", activatedAt: "2026-10-03T10:40:00-05:00", expiresOn: "2026-12-02", creditsUsed: 1, confirmedBy: "Laura Méndez", received: "Efectivo" }),
  cp({ id: "cp7", clientId: "c7", packageId: "p8", method: "whatsapp", status: "active", createdAt: "2026-10-03T16:20:00-05:00", activatedAt: "2026-10-03T16:30:00-05:00", expiresOn: "2027-01-01", creditsUsed: 1, confirmedBy: "Laura Méndez", received: "Transferencia", operation: "00412-88" }),
  cp({ id: "cp8", clientId: "c8", packageId: "p4", method: "whatsapp", status: "active", createdAt: "2026-10-03T18:00:00-05:00", activatedAt: "2026-10-03T18:10:00-05:00", expiresOn: "2026-12-02", creditsUsed: 2, confirmedBy: "María Torres", received: "Yape", operation: "120334" }),
  cp({ id: "cp9", clientId: "c9", packageId: "p20", method: "cash", status: "active", createdAt: "2026-10-04T09:00:00-05:00", activatedAt: "2026-10-04T09:00:00-05:00", expiresOn: "2027-04-02", creditsUsed: 1, confirmedBy: "Laura Méndez", received: "Efectivo" }),
  cp({ id: "cp10", clientId: "c10", packageId: "p1", method: "whatsapp", status: "active", createdAt: "2026-10-04T10:00:00-05:00", activatedAt: "2026-10-04T10:20:00-05:00", expiresOn: "2026-11-03", creditsUsed: 1, confirmedBy: "Laura Méndez", received: "Yape", operation: "774501" }),
  cp({ id: "cp11", clientId: "c11", packageId: "p8", method: "whatsapp", status: "active", createdAt: "2026-10-04T11:30:00-05:00", activatedAt: "2026-10-04T11:45:00-05:00", expiresOn: "2027-01-02", creditsUsed: 1, confirmedBy: "María Torres", received: "Yape", operation: "330981" }),
  cp({ id: "cp12", clientId: "c12", packageId: "p4", method: "cash", status: "active", createdAt: "2026-10-04T17:00:00-05:00", activatedAt: "2026-10-04T17:00:00-05:00", expiresOn: "2026-12-03", creditsUsed: 1, confirmedBy: "Laura Méndez", received: "Efectivo" }),
]

const b = (id: string, sessionId: string, clientId: string, status: Booking["status"] = "booked", waitlistPosition?: number): Booking => ({ id, sessionId, clientId, status, waitlistPosition })

export const bookings: Booking[] = [
  // Lunes 8:00 Reformer (8 cupos, casi lleno)
  b("b1", "s1", "c4", "attended"), b("b2", "s1", "c5", "attended"), b("b3", "s1", "c6", "attended"), b("b4", "s1", "c7", "no_show"), b("b5", "s1", "c8", "attended"), b("b6", "s1", "c9", "attended"), b("b7", "s1", "c11", "attended"),
  // Lunes 9:30 Barre
  b("b8", "s2", "c8"), b("b9", "s2", "c12"),
  // Lunes 12:00 Mat
  b("b10", "s3", "c10"), b("b11", "s3", "c9"), b("b12", "s3", "c4"),
  // Lunes 17:00 Hot (lleno con lista de espera)
  ...["c5", "c6", "c7", "c9", "c11", "c12", "c8", "c4"].map((c, i) => b(`b${20 + i}`, "s4", c)),
  b("b30", "s4", "c10", "booked", 1), b("b31", "s4", "c2", "booked", 2),
  // Lunes 18:30 Dance
  b("b32", "s5", "c11"), b("b33", "s5", "c12"), b("b34", "s5", "c5"),
  // Martes
  b("b40", "s6", "c1", "held"), b("b41", "s6", "c6"), b("b42", "s7", "c7"), b("b43", "s7", "c9"),
  // Miércoles 17:00 Reformer: clase guardada de María Vega
  b("b44", "s13", "c2", "held"), b("b45", "s13", "c4"),
]

export const auditLog: AuditEntry[] = [
  { id: "a1", at: "2026-10-04T17:00:00-05:00", user: "Laura Méndez", action: "Venta manual", detail: "Gabriela Huamán · 4 clases · S/ 260 · efectivo" },
  { id: "a2", at: "2026-10-04T11:45:00-05:00", user: "María Torres", action: "Pago confirmado", detail: "Fernanda Quispe · 8 clases · Yape op. 330981" },
  { id: "a3", at: "2026-10-03T18:40:00-05:00", user: "María Torres", action: "Ajuste manual", detail: "Valentina Ríos · +1 crédito", reason: "Clase del 3 oct cancelada por corte de luz" },
]

export const defaultSettings: Settings = {
  cancelHours: 8,
  bookingWindowDays: 7,
  lateToleranceMinutes: 10,
  waitlistOfferMinutes: 30,
  reminderHours: [24, 12, 2],
  heldClassHoursBefore: 2,
  openingBanner: true,
}

// ---------- helpers de presentación ----------
const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"]
export const parseDate = (d: string) => new Date(`${d}T12:00:00-05:00`)
export const shortDate = (d: string) => {
  const x = parseDate(d)
  return `${DAYS[x.getUTCDay()]} ${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]}`
}
export const longToday = () => "Lunes 5 de octubre de 2026"
export const timeAgo = (iso: string) => {
  const mins = Math.round((Date.parse(NOW) - Date.parse(iso)) / 60000)
  if (mins < 60) return `hace ${mins} min`
  const h = Math.floor(mins / 60)
  return h < 24 ? `hace ${h} h` : `hace ${Math.floor(h / 24)} d`
}
export const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Lima" })
export const methodLabel = (m: Method) => (m === "whatsapp" ? "WhatsApp" : "Efectivo")
