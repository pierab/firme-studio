# Firme Studio · Panel interno (CMS)

Front del panel interno con el stack del equipo: **React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui** (componentes Radix escritos al estilo shadcn en `src/components/ui`). Usa el tema de `../handoff/firme-theme.css` y datos de ejemplo en memoria.

## Pantallas (lanzamiento)
| Ruta | Pantalla | Roles |
| --- | --- | --- |
| `/` | Dashboard del día (Mis clases para Instructora) | Todas |
| `/horarios` | Semana con filtros | Todas (Instructora solo las suyas) |
| `/horarios/:id` | Detalle de clase, asistencia, lista de espera, cancelar clase | Todas (cancelar: Administradora) |
| `/clientas`, `/clientas/:id` | Lista con búsqueda y ficha (reservas, paquetes, ajuste manual auditado) | Administradora, Recepción |
| `/ventas` | Pagos pendientes (confirmar / anular), historial, venta manual, registro de cambios | Administradora, Recepción |
| `/paquetes` | Catálogo, precios, vigencias, clase de prueba | Administradora |
| `/configuracion` | Reglas, recordatorios 24/12/2 h, usuarias y roles | Administradora |

El selector "Ver como" del menú cambia de rol para la demo.

## Correr
```bash
npm install
npm run dev     # desarrollo
npm run build   # build estático en dist/
```

## Llevarlo a Laravel + Inertia
- `src/components/ui/*` y `src/app.css` → `resources/js/components/ui` y `resources/css/app.css` del starter kit de React.
- Cada archivo de `src/pages` es una página de Inertia (`resources/js/pages`); `src/layouts/app-layout.tsx` es el layout autenticado.
- `src/lib/data.ts` define los tipos (Discipline, ClassSession, Booking, ClientPackage, AuditEntry, Settings); en Laravel llegan como props.
- Cada acción de `src/lib/store.tsx` (confirmPayment, voidPayment, manualSale, setBookingStatus, cancelSession, adjustCredits, savePackage, saveSettings) es una ruta POST/PATCH con su validación, transacción y registro en `audit_logs`.
- Reemplazar `HashRouter` por las rutas de Laravel.

Pendiente (diseñado en Figma): crear/editar/reprogramar clase, reservar por una clienta, contenido web, bandeja de reclamos, cupones.
