import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input, Textarea } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDerived, useStore } from "@/lib/store"
import { instructors, methodLabel, shortDate } from "@/lib/data"
import { soles } from "@/lib/utils"

const pkStatus = { pending: ["Pago pendiente", "accent"], active: ["Activo", "success"], expired: ["Vencido", "secondary"], void: ["Anulado", "destructive"] } as const

export default function ClientDetail() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const { discipline, activePackage, credits } = useDerived()
  const [adjOpen, setAdjOpen] = React.useState(false)
  const [delta, setDelta] = React.useState("1")
  const [reason, setReason] = React.useState("")
  const c = state.clients.find((x) => x.id === id)
  if (!c) return <p>No encontramos a esta clienta.</p>
  const cp = activePackage(c.id)
  const history = state.clientPackages.filter((x) => x.clientId === c.id)
  const books = state.bookings
    .filter((b) => b.clientId === c.id)
    .map((b) => ({ b, s: state.sessions.find((s) => s.id === b.sessionId)! }))
    .sort((x, y) => (x.s.date + x.s.time).localeCompare(y.s.date + y.s.time))
  const n = Number(delta)

  return (
    <>
      <Link to="/clientas" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Clientas
      </Link>
      <PageHeader
        title={c.name}
        subtitle={`Clienta desde el ${shortDate(c.since)}`}
        actions={
          <>
            <Button asChild>
              <Link to={`/ventas?nueva=1&clienta=${c.id}`}>Venta manual</Link>
            </Button>
            {state.role === "admin" && cp && (
              <Button variant="outline" onClick={() => setAdjOpen(true)}>
                Ajuste manual
              </Button>
            )}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[13px]">
              {[
                ["DNI", c.dni],
                ["Celular", c.phone],
                ["Correo", c.email],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="text-right">{v}</span>
                </div>
              ))}
              {c.notes && (
                <div className="rounded-md bg-arena p-3">
                  <p className="text-[11px] font-medium tracking-[0.12em] uppercase">Salud · con su permiso</p>
                  <p className="mt-1">{c.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Paquete activo</CardTitle>
            </CardHeader>
            <CardContent className="text-[13px]">
              {cp ? (
                <>
                  <p className="font-serif text-[30px] leading-none">{credits(cp)}</p>
                  <p className="mt-2 text-muted-foreground">
                    {state.catalog.find((p) => p.id === cp.packageId)?.name} · vence el {cp.expiresOn && shortDate(cp.expiresOn)}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Sin paquete activo.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clase</TableHead>
                    <TableHead>Instructora</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground">
                        Sin reservas.
                      </TableCell>
                    </TableRow>
                  )}
                  {books.map(({ b, s }) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <Link to={`/horarios/${s.id}`} className="hover:underline">
                          {discipline(s.disciplineId).name} · {shortDate(s.date)} · {s.time}
                        </Link>
                      </TableCell>
                      <TableCell>{instructors.find((i) => i.id === s.instructorId)?.name}</TableCell>
                      <TableCell>
                        {b.waitlistPosition ? (
                          <Badge variant="outline">En espera · {b.waitlistPosition}</Badge>
                        ) : (
                          <Badge variant={b.status === "held" ? "accent" : b.status === "attended" ? "success" : b.status === "no_show" ? "destructive" : "outline"}>
                            {{ booked: "Reservada", held: "Pago pendiente", attended: "Asistió", no_show: "Falta", cancelled_on_time: "Canceló a tiempo", cancelled_late: "Canceló tarde", cancelled_by_studio: "Cancelada por el estudio" }[b.status]}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Paquetes y pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Confirmó</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>
                        {state.catalog.find((p) => p.id === h.packageId)?.name} · {soles(h.price)}
                      </TableCell>
                      <TableCell>
                        {h.received ?? methodLabel(h.method)}
                        {h.operation && <span className="text-muted-foreground"> · op. {h.operation}</span>}
                      </TableCell>
                      <TableCell>{h.confirmedBy ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={pkStatus[h.status][1]}>{pkStatus[h.status][0]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="text-[11px] font-medium tracking-[0.24em] uppercase">Ajuste manual auditado</p>
            <DialogTitle>{c.name}</DialogTitle>
            <DialogDescription>Saldo actual: {credits(cp)}. El ajuste queda registrado con tu usuaria, la fecha y el motivo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="adj-delta">Créditos (+ suma, − resta) *</Label>
            <Input id="adj-delta" type="number" value={delta} onChange={(e) => setDelta(e.target.value)} className="w-32" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adj-reason">Motivo *</Label>
            <Textarea id="adj-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej.: clase cancelada por corte de luz" />
          </div>
          <DialogFooter>
            <Button
              disabled={!n || !reason.trim() || !cp}
              onClick={() => {
                dispatch({ type: "adjustCredits", clientPackageId: cp!.id, delta: n, reason })
                setAdjOpen(false)
                setReason("")
                toast(`Ajuste registrado · ${n > 0 ? "+" : ""}${n} crédito${Math.abs(n) === 1 ? "" : "s"}`)
              }}
            >
              Registrar ajuste
            </Button>
            <Button variant="outline" onClick={() => setAdjOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
