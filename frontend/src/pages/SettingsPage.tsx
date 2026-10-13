import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth.store'
import api from '../lib/api'

const NICHE_OPTIONS = [
  { value: 'bancario',     label: 'Bancário',               emoji: '🏦' },
  { value: 'farmaceutico', label: 'Farmacêutico',            emoji: '💊' },
  { value: 'chefe_secao',  label: 'Chefe de Seção (Mercado)', emoji: '🛒' },
  { value: 'aeronauta',    label: 'Aeronauta & Aeroviário',  emoji: '✈️' },
]

export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore()
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Carrega niches atuais do /me
    api.get('/auth/me').then(r => {
      setSelected(r.data?.tenant?.niches || [])
    })
  }, [])

  const toggle = (value: string) => {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/tenant/niches', { niches: selected })
      // Atualiza store local
      if (user && token) {
        setAuth({ ...user, tenant: { ...user.tenant, niches: selected } } as any, token)
      }
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-1">Configurações do escritório</h1>
      <p className="text-sm text-gray-500 mb-6">
        Selecione os nichos de atuação. Isso permite que o painel Town filtre corretamente os clientes por área.
      </p>

      <div className="space-y-3 mb-6">
        {NICHE_OPTIONS.map(({ value, label, emoji }) => {
          const active = selected.includes(value)
          return (
            <button
              key={value}
              onClick={() => toggle(value)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left"
              style={{
                borderColor: active ? '#0d9488' : '#e5e7eb',
                background: active ? '#f0fdfa' : '#fff',
                color: active ? '#0d9488' : '#374151',
              }}
            >
              <span className="text-xl">{emoji}</span>
              <span className="font-medium">{label}</span>
              {active && (
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#0d9488', color: '#fff' }}>
                  Ativo
                </span>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
        style={{ background: saving ? '#9ca3af' : 'linear-gradient(90deg, #0d9488, #ea580c)' }}
      >
        {saving ? 'Salvando...' : saved ? 'Salvo ✓' : 'Salvar configurações'}
      </button>
    </div>
  )
}
