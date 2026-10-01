import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter, Route, Routes } from "react-router-dom"
import "./app.css"
import { StoreProvider } from "@/lib/store"
import AppLayout from "@/layouts/app-layout"
import Dashboard from "@/pages/dashboard"
import Schedule from "@/pages/schedule"
import SessionDetail from "@/pages/session-detail"
import Clients from "@/pages/clients"
import ClientDetail from "@/pages/client-detail"
import Sales from "@/pages/sales"
import Packages from "@/pages/packages"
import SettingsPage from "@/pages/settings"

// HashRouter para el prototipo publicado. En Laravel + Inertia cada página
// de /pages se registra como una ruta de Laravel (resources/js/pages).
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="horarios" element={<Schedule />} />
            <Route path="horarios/:id" element={<SessionDetail />} />
            <Route path="clientas" element={<Clients />} />
            <Route path="clientas/:id" element={<ClientDetail />} />
            <Route path="ventas" element={<Sales />} />
            <Route path="paquetes" element={<Packages />} />
            <Route path="configuracion" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  </StrictMode>
)
