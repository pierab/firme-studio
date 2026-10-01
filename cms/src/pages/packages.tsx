import * as React from "react"
import { toast } from "sonner"
import { PageHeader } from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useStore } from "@/lib/store"
import type { Package } from "@/lib/data"
import { soles } from "@/lib/utils"

const blank: Package = { id: "", name: "", classes: 4, price: 0, validityDays: 60, featured: false, active: true, trial: false }

export default function Packages() {
  const { state, dispatch } = useStore()
  const [edit, setEdit] = React.useState<Package | null>(null)
  const save = (p: Package) => dispatch({ type: "savePackage", pkg: p })
  const valid = edit && edit.name.trim() && edit.price > 0 && edit.validityDays > 0

  return (
    <>
      <PageHeader title="Paquetes y precios" subtitle="Lo que ven las clientas en la web. Precios y vigencias de ejemplo hasta que el estudio los confirme." actions={<Button onClick={() => setEdit({ ...blank, id: `p-${Date.now()}` })}>Nuevo paquete</Button>} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paquete</TableHead>
            <TableHead>Clases</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Por clase</TableHead>
            <TableHead>Vigencia</TableHead>
            <TableHead>En la web</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.catalog.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 inline-flex gap-1">
                  {p.featured && <Badge variant="default">Destacado</Badge>}
                  {p.trial && <Badge variant="accent">Una por persona</Badge>}
                </span>
              </TableCell>
              <TableCell>{p.classes ?? "Ilimitado"}</TableCell>
              <TableCell>{soles(p.price)}</TableCell>
              <TableCell className="text-muted-foreground">{p.classes ? soles(Math.round((p.price / p.classes) * 100) / 100) : "—"}</TableCell>
              <TableCell>{p.validityDays} días</TableCell>
              <TableCell>
                <Switch
                  checked={p.active}
                  aria-label={`Mostrar ${p.name} en la web`}
                  onCheckedChange={(v) => {
                    save({ ...p, active: v })
                    toast(`${p.name}: ${v ? "visible" : "oculto"} en la web`)
                  }}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setEdit(p)}>
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-3 text-[12px] text-muted-foreground">Los cambios de precio aplican a compras nuevas; los paquetes ya vendidos conservan su precio y vigencia. Cupones: fase 2.</p>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        {edit && (
          <DialogContent>
            <DialogHeader>
              <p className="text-[11px] font-medium tracking-[0.24em] uppercase">{state.catalog.some((p) => p.id === edit.id) ? "Editar paquete" : "Nuevo paquete"}</p>
              <DialogTitle>{edit.name || "Paquete sin nombre"}</DialogTitle>
              <DialogDescription>{edit.trial ? "La clase de prueba se puede comprar una sola vez por persona." : "Se muestra en la web y en la venta manual."}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="pk-name">Nombre *</Label>
              <Input id="pk-name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="pk-classes">Clases</Label>
                <Input id="pk-classes" type="number" min={1} value={edit.classes ?? ""} placeholder="Ilimitado" onChange={(e) => setEdit({ ...edit, classes: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pk-price">Precio (S/) *</Label>
                <Input id="pk-price" type="number" min={0} value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pk-days">Vigencia (días) *</Label>
                <Input id="pk-days" type="number" min={1} value={edit.validityDays} onChange={(e) => setEdit({ ...edit, validityDays: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex flex-wrap gap-5 text-[13px]">
              <label className="flex items-center gap-2">
                <Checkbox checked={edit.featured} onCheckedChange={(v) => setEdit({ ...edit, featured: v === true })} /> Destacado en la web
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={edit.trial} onCheckedChange={(v) => setEdit({ ...edit, trial: v === true })} /> Es clase de prueba
              </label>
            </div>
            <DialogFooter>
              <Button
                disabled={!valid}
                onClick={() => {
                  save(edit)
                  toast(`${edit.name} guardado`)
                  setEdit(null)
                }}
              >
                Guardar
              </Button>
              <Button variant="outline" onClick={() => setEdit(null)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
