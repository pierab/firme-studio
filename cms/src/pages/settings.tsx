import * as React from "react"
import { toast } from "sonner"
import { PageHeader } from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useStore } from "@/lib/store"

const staff = [
  { name: "María Torres", role: "Administradora", access: "Todo, incluidos precios, reglas, ajustes manuales y cancelar clases" },
  { name: "Laura Méndez", role: "Recepción", access: "Operación del día, reservas, asistencia, clientas, venta manual y pagos pendientes" },
  { name: "Camila Rojas", role: "Instructora", access: "Sus clases y asistencia" },
  { name: "Valeria Paredes", role: "Instructora", access: "Sus clases y asistencia" },
  { name: "Lucía Mendoza", role: "Instructora", access: "Sus clases y asistencia" },
]

export default function SettingsPage() {
  const { state, dispatch } = useStore()
  const [s, setS] = React.useState(state.settings)
  const num = (k: keyof typeof s) => (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [k]: Number(e.target.value) })
  const toggleReminder = (h: number, on: boolean) => setS({ ...s, reminderHours: (on ? [...s.reminderHours, h] : s.reminderHours.filter((x) => x !== h)).sort((a, b) => b - a) })
  const fields: [keyof typeof s, string, string][] = [
    ["cancelHours", "Cancelar y recuperar el crédito hasta", "horas antes"],
    ["bookingWindowDays", "Reservar con anticipación de hasta", "días"],
    ["lateToleranceMinutes", "Tolerancia de llegada", "minutos"],
    ["waitlistOfferMinutes", "Tiempo para aceptar un cupo liberado", "minutos"],
    ["heldClassHoursBefore", "Liberar clase guardada sin pago", "horas antes"],
  ]
  return (
    <>
      <PageHeader title="Configuración" subtitle="Reglas de reserva, recordatorios y usuarias. Valores propuestos, por confirmar con el estudio." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Reglas de reserva</CardTitle>
              <CardDescription>Se aplican a reservas nuevas; se muestran en la web y en los textos legales.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map(([k, label, unit]) => (
              <div key={k} className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
                <Label htmlFor={k} className="text-[13px] font-normal">
                  {label}
                </Label>
                <Input id={k} type="number" min={0} value={s[k] as number} onChange={num(k)} className="w-20 text-right" />
                <span className="w-24 text-[12px] text-muted-foreground">{unit}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-[13px]">Aviso de apertura en la web</p>
                <p className="text-[12px] text-muted-foreground">“Abrimos el lunes 5 de octubre”</p>
              </div>
              <Switch checked={s.openingBanner} onCheckedChange={(v) => setS({ ...s, openingBanner: v })} aria-label="Aviso de apertura" />
            </div>
            <Button
              onClick={() => {
                dispatch({ type: "saveSettings", settings: s })
                toast("Reglas guardadas")
              }}
            >
              Guardar cambios
            </Button>
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader>
            <div>
              <CardTitle>Recordatorios por WhatsApp</CardTitle>
              <CardDescription>Se envían antes de cada clase reservada.</CardDescription>
            </div>
            <Badge variant="accent">Por conectar</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-[13px]">
            {[24, 12, 2].map((h) => (
              <label key={h} className="flex items-center gap-3">
                <Checkbox checked={s.reminderHours.includes(h)} onCheckedChange={(v) => toggleReminder(h, v === true)} />
                {h} horas antes
              </label>
            ))}
            <p className="pt-2 text-[12px] text-muted-foreground">
              Requiere la cuenta de Meta Business verificada y las plantillas aprobadas por Meta (fase 2). Hasta entonces, recepción confirma por WhatsApp de forma manual.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usuarias y roles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Puede</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((u) => (
                <TableRow key={u.name}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "Administradora" ? "default" : u.role === "Recepción" ? "secondary" : "outline"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.access}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
