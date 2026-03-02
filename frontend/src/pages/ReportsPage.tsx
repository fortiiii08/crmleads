import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

export default function ReportsPage() {
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns-report'],
    queryFn: () => api.get('/reports/campaigns').then(r => r.data),
  })

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-report'],
    queryFn: () => api.get('/reports/agents').then(r => r.data),
  })

  const { data: byDay = [] } = useQuery({
    queryKey: ['leads-by-day-30'],
    queryFn: () => api.get('/reports/leads-by-day?days=30').then(r => r.data),
  })

  const { data: dash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reports/dashboard').then(r => r.data),
  })

  const pieData = [
    { name: 'Clientes Fechados', value: dash?.clientesFechados || 0 },
    { name: 'Leads Perdidos', value: dash?.leadsPeridos || 0 },
    { name: 'Em Andamento', value: (dash?.totalLeads || 0) - (dash?.clientesFechados || 0) - (dash?.leadsPeridos || 0) },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-500 mt-0.5">Análise completa de marketing, comercial e equipe</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Leads por Dia (30 dias)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [v, 'Leads']} labelFormatter={l => `Data: ${l}`} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Distribuição de Leads</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Performance por Campanha</h3>
        {campaigns.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma campanha encontrada</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={campaigns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalLeads" name="Total Leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qualified" name="Qualificados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed" name="Fechados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Campanha</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Leads</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Qualificados</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Fechados</th>
                    <th className="text-center py-2 text-gray-500 font-medium">CPL</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Orçamento</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c: any) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3 text-center">{c.totalLeads}</td>
                      <td className="py-3 text-center">{c.qualified}</td>
                      <td className="py-3 text-center text-green-600 font-medium">{c.closed}</td>
                      <td className="py-3 text-center">{c.cpl ? `R$ ${c.cpl}` : '—'}</td>
                      <td className="py-3 text-center">{c.budget ? `R$ ${c.budget.toLocaleString('pt-BR')}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Performance da Equipe</h3>
        {agents.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={agents}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalLeads" name="Leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed" name="Fechados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Atendente</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Leads</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Qualificados</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Fechados</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Conversão</th>
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
                      <td className="py-3 text-center">
                        <span className={`badge ${a.slaOverdue > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {a.slaOverdue}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Endpoint Webhook LinkedIn</h3>
        <p className="text-sm text-gray-600 mb-3">
          Configure a integração Pluga com o endpoint abaixo para receber leads automaticamente:
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm text-gray-700 break-all">
          POST /api/webhooks/linkedin/<span className="text-indigo-600">{'{tenant-slug}'}</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Substitua {'{tenant-slug}'} pelo slug do seu escritório. Campos aceitos: name, phone, email, banco, tempoDesligamento, adName, formName
        </p>
      </div>
    </div>
  )
}
