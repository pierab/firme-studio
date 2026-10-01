import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { PageHeader, Stat } from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDerived, useStore } from "@/lib/store"
import { INSTRUCTOR_SELF, TODAY, instructors, longToday, methodLabel, timeAgo } from "@/lib/data"
import { plural, soles } from "@/lib/utils"

export default function Dashboard() {
  const { state } = useStore()
  const { discipline, sessionTaken, waitlist } = useDerived()
  const isInstructor = state.role === "instructor"
  const today = state.sessions
    .filter((s) => s.date === TODAY && (!isInstructor || s.instructorId === INSTRUCTOR_SELF))
    .sort((a, b) => a.time.localeCompare(b.time))
  const taken = today.reduce((n, s) => n + (s.status === "cancelled" ? 0 : sessionTaken(s.id)), 0)
  const cap = today.reduce((n, s) => n + (s.status === "cancelled" ? 0 : s.capacity), 0)
  const pending = state.clientPackages.filter((c) => c.status === "pending")
  const confirmedToday = state.clientPackages.filter((c) => c.status === "active" && c.activatedAt?.startsWith(TODAY))
  const withWaitlist = today.filter((s) => waitlist(s.id).length > 0)
  const name = (id: string) => state.clients.find((c) => c.id === id)?.name
  const pk = (id: string) => state.catalog.find((p) => p.id === id)!

  return (
    <>
      <PageHeader
        title={isInstructor ? "Mis clases de hoy" : "Dashboard del día"}
        subtitle={`${longToday()} · apertura de Firme`}
        actions={
          !isInstructor && (
            <>
              <Button asChild>
                <Link to="/ventas?nueva=1">Venta manual</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/horarios">Ver horarios</Link>
              </Button>
            </>
          )
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat dark label="Ocupación hoy" value={`${taken} / ${cap}`} hint={`${today.length} clases · ${cap ? Math.round((taken / cap) * 100) : 0} %`} />
        {isInstructor ? (
          <>
            <Stat label="Alumnas por atender" value={String(taken)} hint="Marca la asistencia al empezar cada clase" />
            <Stat label="En lista de espera" value={String(withWaitlist.reduce((n, s) => n + waitlist(s.id).length, 0))} />
          </>
        ) : (
          <>
            <Stat label="Pagos por confirmar" value={String(pending.length)} hint={`${soles(pending.reduce((n, c) => n + c.price, 0))} en total`} />
            <Stat label="Confirmados hoy" value={soles(confirmedToday.reduce((n, c) => n + c.price, 0))} hint={plural(confirmedToday.length, "pago", "pagos")} />
          </>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Clases de hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora · clase</TableHead>
                <TableHead>Instructora</TableHead>
                <TableHead className="w-[30%]">Ocupación</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {today.map((s) => {
                const t = sessionTaken(s.id)
                const w = waitlist(s.id).length
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {s.time} · {discipline(s.disciplineId).name}
                    </TableCell>
                    <TableCell>{instructors.find((i) => i.id === s.instructorId)?.name}</TableCell>
                    <TableCell>
                      {s.status === "cancelled" ? (
                        <Badge variant="destructive">Cancelada</Badge>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-[12px]">
                            {t} / {s.capacity} {t >= s.capacity ? "· llena" : `· ${plural(s.capacity - t, "cupo", "cupos")}`}
                            {w > 0 && ` · ${w} en espera`}
                          </p>
                          <div className="h-1.5 rounded-full bg-arena" aria-hidden>
                            <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.min(100, (t / s.capacity) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/horarios/${s.id}`} className="inline-flex items-center gap-1 text-accent hover:underline">
                        {isInstructor ? "Asistencia" : "Ver clase"} <ArrowRight className="size-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!isInstructor && (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pagos por confirmar</CardTitle>
              <Link to="/ventas" className="text-[13px] text-accent hover:underline">
                Ir a la bandeja →
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.length === 0 && <p className="text-[13px] text-muted-foreground">No hay pagos pendientes.</p>}
              {pending.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-[13px] last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{name(c.clientId)}</p>
                    <p className="text-muted-foreground">
                      {pk(c.packageId).name} · {soles(c.price)} · {methodLabel(c.method)}
                    </p>
                  </div>
                  <span className="text-[12px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lista de espera · seguimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[13px]">
              {withWaitlist.length === 0 && <p className="text-muted-foreground">Sin listas de espera hoy.</p>}
              {withWaitlist.map((s) => (
                <div key={s.id}>
                  <p className="font-medium">
                    {discipline(s.disciplineId).name} · {s.time} · {waitlist(s.id).length} en espera
                  </p>
                  <p className="text-muted-foreground">
                    {waitlist(s.id)
                      .map((b) => `${b.waitlistPosition}. ${name(b.clientId)}`)
                      .join(" · ")}
                  </p>
                  <p className="mt-1 text-muted-foreground">Si se libera un cupo, la primera tiene {state.settings.waitlistOfferMinutes} min para aceptarlo.</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
