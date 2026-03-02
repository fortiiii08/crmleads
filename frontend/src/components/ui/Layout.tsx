import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import {
  LayoutDashboard, Kanban, Users, MessageSquare, BarChart2,
  LogOut, Bell, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kanban', icon: Kanban, label: 'Funil Kanban' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/scripts', icon: MessageSquare, label: 'Scripts' },
  { to: '/reports', icon: BarChart2, label: 'Relatórios' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 flex flex-col shrink-0" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d1f38 100%)' }}>
        <div className="px-5 py-5 border-b border-white/10">
          <img src="/logo.webp" alt="DigiTown" className="h-10 object-contain" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'linear-gradient(90deg, #0d9488, #ea580c)' } : {}}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #ea580c)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-gray-700">CRM Jurídico</span>
          </div>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
