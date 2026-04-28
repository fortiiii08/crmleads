import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import KanbanPage from './pages/KanbanPage'
import LeadsPage from './pages/LeadsPage'
import LeadDetailPage from './pages/LeadDetailPage'
import ScriptsPage from './pages/ScriptsPage'
import ReportsPage from './pages/ReportsPage'
import Layout from './components/ui/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Recebe token do Town via postMessage e troca de cliente sem recarregar
function AutoLoginListener() {
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'CRM_AUTO_LOGIN' && event.data?.token && event.data?.user) {
        localStorage.setItem('crm_token', event.data.token)
        localStorage.setItem('crm_user', JSON.stringify(event.data.user))
        // Força reinicialização do Zustand com o novo usuário
        // Assets JS/CSS estão em cache → recarrega rápido
        window.location.href = '/dashboard'
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [setAuth])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AutoLoginListener />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="scripts" element={<ScriptsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
