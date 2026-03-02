import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import api from '../lib/api'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@crm.com')
  const [password, setPassword] = useState('admin123')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch {
      setError('Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2a3a 50%, #1a1a1a 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.webp" alt="DigiTown" className="h-14 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">CRM Jurídico</h1>
          <p className="text-slate-400 mt-1 text-sm">Gestão de leads para escritórios jurídicos</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full justify-center py-3 rounded-lg font-medium text-sm text-white transition-all disabled:opacity-50" style={{ background: 'linear-gradient(90deg, #0d9488, #ea580c)' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-2">Credenciais demo:</p>
            <div className="space-y-1 text-xs text-gray-400 text-center">
              <p>Admin: admin@crm.com / admin123</p>
              <p>Agente: agente@crm.com / agent123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
