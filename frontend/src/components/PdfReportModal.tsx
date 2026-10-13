import { useState, useRef, useEffect } from 'react'
import { X, FileDown, Loader2 } from 'lucide-react'
import api from '../lib/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useDateRangeStore } from '../store/dateRange.store'

function toLocalISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-')
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`
}

function fmtDateShort(v: string) {
  const [, m, d] = v.split('-')
  const months = ['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.']
  return `${parseInt(d)} de ${months[parseInt(m) - 1]}`
}

interface ReportData {
  dash: any
  byDay: { date: string; count: number }[]
  agents: any[]
  from: string
  to: string
}

export default function PdfReportModal({ onClose }: { onClose: () => void }) {
  const today = toLocalISO(new Date())
  const stored = useDateRangeStore()
  const [from, setFrom] = useState(stored.from)
  const [to, setTo] = useState(stored.to)
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  // Após o state mudar e o React re-renderizar, captura e gera o PDF
  useEffect(() => {
    if (!reportData) return

    const capture = async () => {
      // Aguarda recharts renderizar o gráfico completamente
      await new Promise(r => setTimeout(r, 800))

      const el = printRef.current
      if (!el) { setLoading(false); return }

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pageW) / canvas.width

      if (imgH <= pageH) {
        pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH)
      } else {
        let yOffset = 0
        while (yOffset < imgH) {
          pdf.addImage(imgData, 'PNG', 0, -yOffset, pageW, imgH)
          yOffset += pageH
          if (yOffset < imgH) pdf.addPage()
        }
      }

      pdf.save(`relatorio-leads-${reportData.from}-a-${reportData.to}.pdf`)
      setLoading(false)
      setReportData(null)
    }

    capture()
  }, [reportData])

  async function generate() {
    setLoading(true)
    try {
      const params = `from=${from}&to=${to}`
      const [dash, byDay, agents] = await Promise.all([
        api.get(`/reports/dashboard?${params}`).then(r => r.data),
        api.get(`/reports/leads-by-day?${params}`).then(r => r.data),
        api.get(`/reports/agents?${params}`).then(r => r.data),
      ])
      // Seta o state → React re-renderiza o div oculto com dados reais → useEffect captura
      setReportData({ dash, byDay, agents, from, to })
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Exportar Relatório PDF</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Selecione o período para gerar o relatório com gráfico e métricas.
        </p>

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Data inicial</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={e => setFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Data final</label>
            <input
              type="date"
              value={to}
              min={from}
              max={today}
              onChange={e => setTo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancelar
          </button>
          <button
            onClick={generate}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {loading ? 'Gerando...' : 'Gerar PDF'}
          </button>
        </div>
      </div>

      {/* Div oculto renderizado com dados reais antes da captura */}
      {reportData && (
        <div
          ref={printRef}
          style={{
            position: 'fixed',
            top: 0,
            left: '-9999px',
            width: '794px',
            background: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            padding: '40px',
          }}
        >
          {/* Cabeçalho */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Relatório de Leads</h1>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                {fmtDate(reportData.from)} → {fmtDate(reportData.to)}
              </p>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
              Gerado em {fmtDate(today)}
            </p>
          </div>

          {/* Cards de métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total de Leads', value: reportData.dash?.totalLeads ?? '—', color: '#6366f1' },
              { label: 'Clientes Fechados', value: reportData.dash?.clientesFechados ?? '—', color: '#22c55e' },
              { label: 'Leads Perdidos', value: reportData.dash?.leadsPeridos ?? '—', color: '#ef4444' },
              { label: 'Taxa de Conversão', value: reportData.dash ? `${reportData.dash.taxaFechamento}%` : '—', color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} style={{ background: '#f9fafb', borderRadius: 12, padding: '16px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: '6px 0 0' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Gráfico */}
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: '20px', marginBottom: 32, border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12, margin: '0 0 12px 0' }}>
              Leads por Dia
            </p>
            {reportData.byDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={reportData.byDay} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={fmtDateShort}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.max(0, Math.floor(reportData.byDay.length / 8) - 1)}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={5}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }}
                    formatter={(v: any) => [v, 'Leads']}
                    labelFormatter={(l: string) => fmtDateShort(l)}
                  />
                  <Line
                    type="linear"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Nenhum dado no período selecionado.</p>
            )}
          </div>

          {/* Tabela de equipe */}
          {reportData.agents.length > 0 && (
            <div style={{ borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ background: '#f9fafb', padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Performance da Equipe</p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Atendente', 'Leads', 'Qualificados', 'Fechados', 'Conversão', 'SLA OK', 'SLA Vencido'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Atendente' ? 'left' : 'center', color: '#6b7280', fontWeight: 500, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.agents.map((a: any, i: number) => (
                    <tr key={a.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 500, color: '#111827' }}>{a.name}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#374151' }}>{a.totalLeads}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#374151' }}>{a.qualified}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{a.closed}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#4f46e5', fontWeight: 600 }}>{a.conversionRate}%</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#16a34a' }}>{a.slaOk}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#dc2626' }}>{a.slaOverdue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Rodapé */}
          <p style={{ fontSize: 10, color: '#d1d5db', textAlign: 'center', marginTop: 32 }}>
            CRM Jurídico — relatório gerado automaticamente em {fmtDate(today)}
          </p>
        </div>
      )}
    </div>
  )
}
