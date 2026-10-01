import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/input"
import { useDerived, useStore } from "@/lib/store"
import { INSTRUCTOR_SELF, instructors, shortDate, type Booking } from "@/lib/data"

const statusLabel: Record<Booking["status"], { text: string; variant: "outline" | "success" | "destructive" | "secondary" | "accent" }> = {
  booked: { text: "Reservada", variant: "outline" },
  held: { text: "Pago pendiente", variant: "accent" },
  attended: { text: "Asistió", variant: "success" },
  no_show: { text: "Falta", variant: "destructive" },
  cancelled_on_time: { text: "Canceló a tiempo", variant: "secondary" },
  cancelled_late: { text: "Canceló tarde", variant: "destructive" },
  cancelled_by_studio: { text: "Cancelada por el estudio", variant: "secondary" },
}

export default function SessionDetail() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const { discipline, sessionTaken, waitlist, activePackage, credits } = useDerived()
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")
  const s = state.sessions.find((x) => x.id === id)
  if (!s) return <p>No encontramos esta clase.</p>
  const isInstructor = state.role === "instructor"
  if (isInstructor && s.instructorId !== INSTRUCTOR_SELF) return <p className="py-20 text-sm">Esta clase no es tuya.</p>
  const d = discipline(s.disciplineId)
  const ins = instructors.find((x) => x.id === s.instructorId)!
  const list = state.bookings.filter((b) => b.sessionId === s.id && !b.waitlistPosition)
  const wl = waitlist(s.id)
  const client = (cid: string) => state.clients.find((c) => c.id === cid)!
  const canMark = s.status !== "cancelled" && (state.role !== "instructor" || s.instructorId === INSTRUCTOR_SELF)

  const mark = (b: Booking, status: Booking["status"]) => {
    dispatch({ type: "setBookingStatus", id: b.id, status })
    toast(`${client(b.clientId).name}: ${statusLabel[status].text.toLowerCase()}`)
  }

  return (
    <>
      <Link to="/horarios" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Horarios
      </Link>
      <PageHeader
        title={`${d.name} · ${s.time}`}
        subtitle={`${shortDate(s.date)} · ${ins.name} · ${d.minutes} min · ${sessionTaken(s.id)} de ${s.capacity} cupos`}
        actions={
          state.role === "admin" &&
          s.status !== "cancelled" && (
            <Button variant="destructive" onClick={() => setCancelOpen(true)}>
              Cancelar clase
            </Button>
          )
        }
      />
      {s.status === "cancelled" && (
        <p className="mb-5 rounded-md bg-destructive/10 px-4 py-3 text-[13px] text-destructive">Clase cancelada por el estudio. Se devolvió 1 crédito a cada inscrita.</p>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Inscritas · asistencia</CardTitle>
              <CardDescription>Marca a cada alumna al empezar. Tolerancia de {state.settings.lateToleranceMinutes} min.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clienta</TableHead>
                  {!isInstructor && <TableHead>Créditos</TableHead>}
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Asistencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      Aún no hay reservas.
                    </TableCell>
                  </TableRow>
                )}
                {list.map((b) => {
                  const c = client(b.clientId)
                  return (
                    <TableRow key={b.id}>
                      <TableCell>
                        {isInstructor ? (
                          <span className="font-medium">{c.name}</span>
                        ) : (
                          <Link to={`/clientas/${c.id}`} className="font-medium hover:underline">
                            {c.name}
                          </Link>
                        )}
                        {c.notes && <p className="mt-0.5 text-[12px] text-accent">{c.notes}</p>}
                      </TableCell>
                      {!isInstructor && <TableCell className="text-muted-foreground">{credits(activePackage(c.id))}</TableCell>}
                      <TableCell>
                        <Badge variant={statusLabel[b.status].variant}>{statusLabel[b.status].text}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canMark && ["booked", "attended", "no_show"].includes(b.status) && (
                          <div className="inline-flex gap-1.5">
                            <Button size="sm" variant={b.status === "attended" ? "default" : "outline"} aria-pressed={b.status === "attended"} onClick={() => mark(b, b.status === "attended" ? "booked" : "attended")}>
                              Asistió
                            </Button>
                            <Button size="sm" variant={b.status === "no_show" ? "destructive" : "ghost"} aria-pressed={b.status === "no_show"} onClick={() => mark(b, b.status === "no_show" ? "booked" : "no_show")}>
                              Falta
                            </Button>
                          </div>
                        )}
                        {b.status === "held" && <span className="text-[12px] text-muted-foreground">Se confirma con el pago</span>}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Lista de espera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[13px]">
            {wl.length === 0 && <p className="text-muted-foreground">Nadie en espera.</p>}
            {wl.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <span>
                  {b.waitlistPosition}. {client(b.clientId).name}
                </span>
                {b.waitlistPosition === 1 && <Badge variant="accent">Primera</Badge>}
              </div>
            ))}
            <p className="text-[12px] text-muted-foreground">Si se libera un cupo, WhatsApp le ofrece el lugar a la primera; tiene {state.settings.waitlistOfferMinutes} min para aceptarlo.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="text-[11px] font-medium tracking-[0.24em] uppercase">Cancelar clase</p>
            <DialogTitle>
              {d.name} · {shortDate(s.date)} · {s.time}
            </DialogTitle>
            <DialogDescription>
              Se devolverá 1 crédito a las {list.filter((b) => b.status === "booked" || b.status === "held").length} inscritas y se les avisará. Esta acción queda registrada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="cancel-reason">Motivo *</Label>
            <Textarea id="cancel-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej.: la instructora está enferma" />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={!reason.trim()}
              onClick={() => {
                dispatch({ type: "cancelSession", id: s.id, reason })
                setCancelOpen(false)
                toast("Clase cancelada · créditos devueltos")
              }}
            >
              Cancelar clase
            </Button>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Volver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
