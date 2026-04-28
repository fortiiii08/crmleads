import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Users, TrendingUp, UserCheck, UserX, Clock, AlertTriangle, CalendarRange, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

function SlaBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-24">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(value * 10, 100)}%` }} />
      </div>
      <span className="text-sm font-medium w-6 text-right">{value}</span>
    </div>
  )
}

const PRESETS = [
  { label: 'Hoje', days: 0 },
  { label: '7 dias', days: 7 },
  { label: '14 dias', days: 14 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
]

function toLocalISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function subtractDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return toLocalISO(d)
}

export default function DashboardPage() {
  const today = toLocalISO(new Date())
  const [from, setFrom] = useState(subtractDays(30))
  const [to, setTo] = useState(today)

  const params = `from=${from}&to=${to}`

  const { data: dash } = useQuery({
    queryKey: ['dashboard', from, to],
    queryFn: () => api.get(`/reports/dashboard?${params}`).then(r => r.data),
  })
  const { data: byDay = [] } = useQuery({
    queryKey: ['leads-by-day', from, to],
    queryFn: () => api.get(`/reports/leads-by-day?${params}`).then(r => r.data),
  })
  const { data: agents = [] } = useQuery({
    queryKey: ['agents-report', from, to],
    queryFn: () => api.get(`/reports/agents?${params}`).then(r => r.data),
  })

  function applyPreset(days: number) {
    setFrom(days === 0 ? today : subtractDays(days))
    setTo(today)
  }

  const isCustom = !PRESETS.some(p => {
    const expectedFrom = p.days === 0 ? today : subtractDays(p.days)
    return from === expectedFrom && to === today
  })

  const rangeLabel = isCustom
    ? `${from} → ${to}`
    : PRESETS.find(p => from === (p.days === 0 ? today : subtractDays(p.days)) && to === today)?.label

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral do desempenho comercial</p>
        </div>

        {/* Date range selector */}
        <div className="card p-3 flex flex-wrap items-center gap-2">
          <CalendarRange className="w-4 h-4 text-gray-400 shrink-0" />

          {/* Presets */}
          <div className="flex gap-1 flex-wrap">
            {PRESETS.map(p => {
              const active = from === (p.days === 0 ? today : subtractDays(p.days)) && to === today
              return (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.days)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          <div className="h-4 w-px bg-gray-200" />

          {/* Custom dates */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={from}
              max={to}
              onChange={e => setFrom(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <span className="text-gray-400 text-xs">→</span>
            <input
              type="date"
              value={to}
              min={from}
              max={today}
              onChange={e => setTo(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Leads" value={dash?.totalLeads} icon={Users} color="bg-indigo-500" sub={`+${dash?.leadsToday || 0} no período`} />
        <StatCard label="Clientes Fechados" value={dash?.clientesFechados} icon={UserCheck} color="bg-green-500" sub={`${dash?.taxaFechamento}% conversão`} />
        <StatCard label="Leads Perdidos" value={dash?.leadsPeridos} icon={UserX} color="bg-red-500" />
        <StatCard label="Tempo Médio Contato" value={dash?.avgFirstContactMinutes != null ? `${dash.avgFirstContactMinutes}min` : '—'} icon={Clock} color="bg-blue-500" sub="primeiro contato" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">
            Leads por Dia
            <span className="ml-2 text-xs font-normal text-gray-400">{rangeLabel}</span>
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [v, 'Leads']} labelFormatter={l => `Data: ${l}`} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Status SLA</h3>
          </div>
          <div className="space-y-3">
            <SlaBar label="OK" value={dash?.sla?.ok || 0} color="bg-green-500" />
            <SlaBar label="Atenção (5min)" value={dash?.sla?.warning || 0} color="bg-yellow-500" />
            <SlaBar label="Crítico (10min)" value={dash?.sla?.critical || 0} color="bg-orange-500" />
            <SlaBar label="Vencido (30min+)" value={dash?.sla?.overdue || 0} color="bg-red-500" />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          Performance da Equipe
          <span className="ml-2 text-xs font-normal text-gray-400">{rangeLabel}</span>
        </h3>
        {agents.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Atendente</th>
                  <th className="text-center py-2 text-gray-500 font-medium">Leads</th>
                  <th className="text-center py-2 text-gray-500 font-medium">Qualificados</th>
                  <th className="text-center py-2 text-gray-500 font-medium">Fechados</th>
                  <th className="text-center py-2 text-gray-500 font-medium">Conversão</th>
                  <th className="text-center py-2 text-gray-500 font-medium">SLA OK</th>
                  <th className="text-center py-2 text-gray-500 font-medium">SLA Vencido</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a: any) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium">{a.name}</td>
                    <td className="py-3 text-center">{a.totalLeads}</td>
                    <td className="py-3 text-center">{a.qualified}</td>
                    <td className="py-3 text-center text-green-600 font-medium">{a.closed}</td>
                    <td className="py-3 text-center">
                      <span className="badge bg-indigo-50 text-indigo-700">{a.conversionRate}%</span>
                    </td>
                    <td className="py-3 text-center text-green-600">{a.slaOk}</td>
                    <td className="py-3 text-center text-red-600">{a.slaOverdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
