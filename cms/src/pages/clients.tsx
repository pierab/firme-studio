import * as React from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { PageHeader } from "@/layouts/app-layout"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDerived, useStore } from "@/lib/store"
import { shortDate } from "@/lib/data"

export default function Clients() {
  const { state } = useStore()
  const { activePackage, credits } = useDerived()
  const [q, setQ] = React.useState("")
  const norm = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
  const list = state.clients.filter((c) => !q || norm(`${c.name} ${c.dni} ${c.phone} ${c.email}`).includes(norm(q)))
  return (
    <>
      <PageHeader title="Clientas" subtitle={`${state.clients.length} clientas registradas`} />
      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, DNI, celular o correo" className="pl-9" aria-label="Buscar clientas" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clienta</TableHead>
            <TableHead>Celular</TableHead>
            <TableHead>Paquete</TableHead>
            <TableHead>Créditos</TableHead>
            <TableHead>Vence</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No encontramos clientas con “{q}”.
              </TableCell>
            </TableRow>
          )}
          {list.map((c) => {
            const cp = activePackage(c.id)
            const pending = state.clientPackages.find((x) => x.clientId === c.id && x.status === "pending")
            return (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-[12px] text-muted-foreground">DNI {c.dni}</p>
                </TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>
                  {cp ? state.catalog.find((p) => p.id === cp.packageId)?.name : pending ? <Badge variant="accent">Pago pendiente</Badge> : <span className="text-muted-foreground">Sin paquete</span>}
                </TableCell>
                <TableCell>{cp ? credits(cp) : "—"}</TableCell>
                <TableCell>{cp?.expiresOn ? shortDate(cp.expiresOn) : "—"}</TableCell>
                <TableCell className="text-right">
                  <Link to={`/clientas/${c.id}`} className="text-accent hover:underline">
                    Ver ficha →
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}
