import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader, Stat } from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input, Textarea } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useDerived, useStore } from "@/lib/store"
import { TODAY, hhmm, methodLabel, shortDate, timeAgo, type ClientPackage } from "@/lib/data"
import { plural, soles } from "@/lib/utils"

const RECEIVED = ["Yape", "Plin", "Transferencia", "Efectivo"]

export default function Sales() {
  const { state, dispatch } = useStore()
  const { discipline } = useDerived()
  const [params, setParams] = useSearchParams()
  const [confirming, setConfirming] = React.useState<ClientPackage | null>(null)
  const [voiding, setVoiding] = React.useState<ClientPackage | null>(null)
  const [received, setReceived] = React.useState("Yape")
  const [op, setOp] = React.useState("")
  const [notify, setNotify] = React.useState(true)
  const [reason, setReason] = React.useState("")
  const saleOpen = params.get("nueva") === "1"
  const [sale, setSale] = React.useState({ clientId: params.get("clienta") ?? "", packageId: "p8", received: "Efectivo", op: "" })
  React.useEffect(() => {
    if (saleOpen) setSale((x) => ({ ...x, clientId: params.get("clienta") ?? x.clientId }))
  }, [saleOpen, params])

  const name = (id: string) => state.clients.find((c) => c.id === id)?.name ?? ""
  const pk = (id: string) => state.catalog.find((p) => p.id === id)!
  const pending = state.clientPackages.filter((c) => c.status === "pending").sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const history = state.clientPackages.filter((c) => c.status !== "pending").sort((a, b) => (b.activatedAt ?? b.createdAt).localeCompare(a.activatedAt ?? a.createdAt))
  const today = history.filter((c) => c.status === "active" && c.activatedAt?.startsWith(TODAY))
  const held = (c: ClientPackage) => {
    const s = state.sessions.find((x) => x.id === c.heldSessionId)
    return s ? `${discipline(s.disciplineId).name} · ${shortDate(s.date)} · ${s.time}` : "Sin clase guardada"
  }
  const openConfirm = (c: ClientPackage) => {
    setConfirming(c)
    setReceived(c.method === "cash" ? "Efectivo" : "Yape")
    setOp("")
    setNotify(true)
  }

  return (
    <>
      <PageHeader
        title="Ventas"
        subtitle="Paquetes reservados en la web con pago por WhatsApp o efectivo, y ventas en recepción"
        actions={<Button onClick={() => setParams({ nueva: "1" })}>Venta manual</Button>}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat dark label="Por confirmar" value={String(pending.length)} hint={`${soles(pending.reduce((n, c) => n + c.price, 0))} en total`} />
        <Stat label="Confirmados hoy" value={soles(today.reduce((n, c) => n + c.price, 0))} hint={plural(today.length, "pago", "pagos")} />
        <Stat label="Más antiguo" value={pending[0] ? timeAgo(pending[0].createdAt) : "—"} hint={pending[0] ? `${name(pending[0].clientId)} · ${held(pending[0])}` : "Bandeja al día"} />
      </div>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pagos pendientes ({pending.length})</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          {state.role === "admin" && <TabsTrigger value="audit">Registro de cambios</TabsTrigger>}
        </TabsList>
        <TabsContent value="pending" className="mt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clienta</TableHead>
                <TableHead>Paquete y monto</TableHead>
                <TableHead>Cómo pagará</TableHead>
                <TableHead>Clase guardada</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No hay pagos por confirmar.
                  </TableCell>
                </TableRow>
              )}
              {pending.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium">{name(c.clientId)}</p>
                    <p className="text-[12px] text-muted-foreground">{state.clients.find((x) => x.id === c.clientId)?.phone}</p>
                  </TableCell>
                  <TableCell>
                    {pk(c.packageId).name} · {soles(c.price)}
                  </TableCell>
                  <TableCell>
                    {methodLabel(c.method)} · <span className="text-muted-foreground">{timeAgo(c.createdAt)}</span>
                  </TableCell>
                  <TableCell>{held(c)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1.5">
                      <Button size="sm" onClick={() => openConfirm(c)}>
                        Confirmar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => (setVoiding(c), setReason(""))}>
                        Anular
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-3 text-[12px] text-muted-foreground">
            Por definir con el estudio: la clase guardada se libera {state.settings.heldClassHoursBefore} h antes de empezar si el pago no se confirma (propuesta).
          </p>
        </TabsContent>
        <TabsContent value="history" className="mt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Clienta</TableHead>
                <TableHead>Paquete</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Registró</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="whitespace-nowrap">
                    {shortDate((c.activatedAt ?? c.createdAt).slice(0, 10))} · {hhmm(c.activatedAt ?? c.createdAt)}
                  </TableCell>
                  <TableCell>{name(c.clientId)}</TableCell>
                  <TableCell>
                    {pk(c.packageId).name} · {soles(c.price)}
                  </TableCell>
                  <TableCell>
                    {c.received ?? methodLabel(c.method)}
                    {c.operation && <span className="text-muted-foreground"> · op. {c.operation}</span>}
                  </TableCell>
                  <TableCell>{c.confirmedBy ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "active" ? "success" : c.status === "void" ? "destructive" : "secondary"}>{c.status === "active" ? "Activo" : c.status === "void" ? "Anulado" : "Vencido"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="audit" className="mt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuándo</TableHead>
                <TableHead>Usuaria</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.audit.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap">
                    {shortDate(a.at.slice(0, 10))} · {hhmm(a.at)}
                  </TableCell>
                  <TableCell>{a.user}</TableCell>
                  <TableCell className="font-medium">{a.action}</TableCell>
                  <TableCell>{a.detail}</TableCell>
                  <TableCell className="text-muted-foreground">{a.reason ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Confirmar pago */}
      <Dialog open={!!confirming} onOpenChange={(o) => !o && setConfirming(null)}>
        {confirming && (
          <DialogContent>
            <DialogHeader>
              <p className="text-[11px] font-medium tracking-[0.24em] uppercase">Confirmar pago</p>
              <DialogTitle>
                {name(confirming.clientId)} · {pk(confirming.packageId).name}
              </DialogTitle>
              <DialogDescription>
                {soles(confirming.price)} · eligió pagar {confirming.method === "cash" ? "en efectivo" : "por WhatsApp"} · reservó {timeAgo(confirming.createdAt)}
                <br />
                Clase guardada: {held(confirming)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label>Método recibido *</Label>
              <Select value={received} onValueChange={setReceived}>
                <SelectTrigger aria-label="Método recibido">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECEIVED.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {received !== "Efectivo" && (
              <div className="grid gap-2">
                <Label htmlFor="op">N.º de operación (opcional)</Label>
                <Input id="op" value={op} onChange={(e) => setOp(e.target.value)} placeholder="Ej.: 983124" inputMode="numeric" />
              </div>
            )}
            <label className="flex items-center gap-3 text-[13px]">
              <Checkbox checked={notify} onCheckedChange={(v) => setNotify(v === true)} />
              Enviar confirmación por WhatsApp
            </label>
            <DialogFooter>
              <Button
                onClick={() => {
                  dispatch({ type: "confirmPayment", id: confirming.id, received, operation: op || undefined })
                  toast(`Pago confirmado · ${pk(confirming.packageId).classes ?? "∞"} créditos activados${notify ? " · WhatsApp enviado" : ""}`)
                  setConfirming(null)
                }}
              >
                Confirmar y activar
              </Button>
              <Button variant="outline" onClick={() => setConfirming(null)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Anular */}
      <Dialog open={!!voiding} onOpenChange={(o) => !o && setVoiding(null)}>
        {voiding && (
          <DialogContent>
            <DialogHeader>
              <p className="text-[11px] font-medium tracking-[0.24em] uppercase">Anular reserva del paquete</p>
              <DialogTitle>{name(voiding.clientId)}</DialogTitle>
              <DialogDescription>
                {pk(voiding.packageId).name} · {soles(voiding.price)}. Se libera la clase guardada ({held(voiding)}) y se avisa a la clienta.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="void-reason">Motivo *</Label>
              <Textarea id="void-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej.: no respondió por WhatsApp" />
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={!reason.trim()}
                onClick={() => {
                  dispatch({ type: "voidPayment", id: voiding.id, reason })
                  toast("Reserva anulada · cupo liberado")
                  setVoiding(null)
                }}
              >
                Anular
              </Button>
              <Button variant="outline" onClick={() => setVoiding(null)}>
                Volver
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Venta manual */}
      <Dialog open={saleOpen} onOpenChange={(o) => !o && setParams({})}>
        <DialogContent>
          <DialogHeader>
            <p className="text-[11px] font-medium tracking-[0.24em] uppercase">Venta manual</p>
            <DialogTitle>Registrar venta en recepción</DialogTitle>
            <DialogDescription>El paquete se activa al guardar. Queda registrado con tu usuaria y la hora.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Clienta *</Label>
            <Select value={sale.clientId} onValueChange={(v) => setSale({ ...sale, clientId: v })}>
              <SelectTrigger aria-label="Clienta">
                <SelectValue placeholder="Selecciona una clienta" />
              </SelectTrigger>
              <SelectContent>
                {state.clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} · DNI {c.dni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Paquete *</Label>
            <Select value={sale.packageId} onValueChange={(v) => setSale({ ...sale, packageId: v })}>
              <SelectTrigger aria-label="Paquete">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.catalog
                  .filter((p) => p.active)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} · {soles(p.price)} · {p.validityDays} días
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Método *</Label>
              <Select value={sale.received} onValueChange={(v) => setSale({ ...sale, received: v })}>
                <SelectTrigger aria-label="Método">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECEIVED.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {sale.received !== "Efectivo" && (
              <div className="grid gap-2">
                <Label htmlFor="sale-op">N.º de operación</Label>
                <Input id="sale-op" value={sale.op} onChange={(e) => setSale({ ...sale, op: e.target.value })} />
              </div>
            )}
          </div>
          <p className="font-serif text-[28px]">Total {soles(pk(sale.packageId).price)}</p>
          <DialogFooter>
            <Button
              disabled={!sale.clientId}
              onClick={() => {
                dispatch({ type: "manualSale", clientId: sale.clientId, packageId: sale.packageId, received: sale.received, operation: sale.op || undefined })
                toast(`Venta registrada · ${name(sale.clientId)}`)
                setParams({})
              }}
            >
              Registrar y activar
            </Button>
            <Button variant="outline" onClick={() => setParams({})}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
