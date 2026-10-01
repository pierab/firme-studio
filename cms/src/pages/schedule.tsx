import * as React from "react"
import { Link } from "react-router-dom"
import { PageHeader } from "@/layouts/app-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDerived, useStore } from "@/lib/store"
import { INSTRUCTOR_SELF, disciplines, instructors, shortDate } from "@/lib/data"
import { cn } from "@/lib/utils"

const WEEK = ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"]

export default function Schedule() {
  const { state } = useStore()
  const { discipline, sessionTaken, waitlist } = useDerived()
  const isInstructor = state.role === "instructor"
  const [d, setD] = React.useState("all")
  const [i, setI] = React.useState(isInstructor ? INSTRUCTOR_SELF : "all")
  const list = state.sessions.filter(
    (s) => (d === "all" || s.disciplineId === d) && (isInstructor ? s.instructorId === INSTRUCTOR_SELF : i === "all" || s.instructorId === i)
  )
  return (
    <>
      <PageHeader title="Horarios" subtitle="Semana del 5 al 11 de octubre de 2026 · horario de ejemplo hasta recibir el del estudio" />
      <div className="mb-5 flex flex-wrap gap-3">
        <Select value={d} onValueChange={setD}>
          <SelectTrigger className="w-48" aria-label="Filtrar por clase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las clases</SelectItem>
            {disciplines.map((x) => (
              <SelectItem key={x.id} value={x.id}>
                {x.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isInstructor && (
          <Select value={i} onValueChange={setI}>
            <SelectTrigger className="w-52" aria-label="Filtrar por instructora">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las instructoras</SelectItem>
              {instructors.map((x) => (
                <SelectItem key={x.id} value={x.id}>
                  {x.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        {WEEK.map((day) => {
          const items = list.filter((s) => s.date === day).sort((a, b) => a.time.localeCompare(b.time))
          return (
            <section key={day} aria-label={shortDate(day)}>
              <h2 className="mb-2 border-t border-border pt-3 text-[12px] font-medium tracking-[0.12em] uppercase">{shortDate(day)}</h2>
              <div className="space-y-2">
                {items.length === 0 && <p className="py-2 text-[12px] text-muted-foreground">Sin clases</p>}
                {items.map((s) => {
                  const t = sessionTaken(s.id)
                  const full = t >= s.capacity
                  const low = !full && s.capacity - t <= 2
                  const w = waitlist(s.id).length
                  const ins = instructors.find((x) => x.id === s.instructorId)!
                  return (
                    <Link
                      key={s.id}
                      to={`/horarios/${s.id}`}
                      aria-label={`${discipline(s.disciplineId).name}, ${shortDate(s.date)}, ${s.time}, con ${ins.name}, ${t} de ${s.capacity} cupos`}
                      className={cn(
                        "block rounded-md border bg-white/70 p-3 transition-colors hover:bg-porcelana",
                        s.status === "cancelled" ? "border-destructive/40 opacity-60" : low ? "border-accent" : full ? "border-border bg-arena" : "border-border"
                      )}
                    >
                      <p className="font-serif text-[22px] leading-none">{s.time}</p>
                      <p className="mt-2 text-[13px] font-medium">{discipline(s.disciplineId).name}</p>
                      <p className="text-[12px] text-muted-foreground">{ins.name.split(" ")[0]}</p>
                      <p className={cn("mt-2 text-[11px]", s.status === "cancelled" ? "text-destructive" : low ? "text-accent" : "text-muted-foreground")}>
                        {s.status === "cancelled" ? "Cancelada" : `${t}/${s.capacity}${full ? " · llena" : ""}${w ? ` · ${w} en espera` : ""}`}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      <p className="mt-6 text-[12px] text-muted-foreground">Borde arcilla: últimos 2 cupos · fondo arena: clase llena. Crear, editar y reprogramar clases llega en la siguiente iteración (ya diseñado en Figma).</p>
    </>
  )
}
