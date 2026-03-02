import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../lib/api'
import { Copy, Plus, Edit, FileText, MessageCircle, CheckCircle, Calendar, RefreshCw, Briefcase } from 'lucide-react'

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  FIRST_CONTACT: { label: 'Primeiro Contato', icon: MessageCircle, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  QUALIFICATION: { label: 'Qualificação', icon: CheckCircle, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  FOLLOW_UP: { label: 'Follow-up', icon: RefreshCw, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  SCHEDULING: { label: 'Agendamento', icon: Calendar, color: 'bg-green-50 text-green-700 border-green-200' },
  REACTIVATION: { label: 'Reativação', icon: RefreshCw, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  PROPOSAL: { label: 'Proposta', icon: Briefcase, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  CLOSING: { label: 'Fechamento', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

function ScriptCard({ script, onCopy }: { script: any; onCopy: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = CATEGORY_CONFIG[script.category] || CATEGORY_CONFIG.FIRST_CONTACT

  const copy = () => {
    navigator.clipboard.writeText(script.content)
    api.post(`/scripts/${script.id}/use`)
    onCopy()
  }

  return (
    <div className={`card border ${cfg.color.split(' ').slice(-1)[0]} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge border ${cfg.color}`}>
                {cfg.label}
              </span>
              {script.area && <span className="badge bg-gray-100 text-gray-600">{script.area}</span>}
              <span className="text-xs text-gray-400">{script.usageCount} usos</span>
            </div>
            <h3 className="font-semibold text-gray-900">{script.title}</h3>
          </div>
          <button onClick={copy} className="btn-secondary text-xs shrink-0">
            <Copy className="w-3 h-3" />
            Copiar
          </button>
        </div>

        <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-600 mt-2 hover:underline">
          {expanded ? 'Ocultar' : 'Ver script'}
        </button>

        {expanded && (
          <pre className="mt-3 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100 font-sans">
            {script.content}
          </pre>
        )}
      </div>
    </div>
  )
}

function NewScriptModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ title: '', content: '', category: 'FIRST_CONTACT', area: 'Trabalhista' })

  const mutation = useMutation({
    mutationFn: () => api.post('/scripts', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scripts'] }); onClose() },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg p-6">
        <h2 className="text-lg font-bold mb-5">Novo Script</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Título</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Ex: Primeiro Contato WhatsApp" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Categoria</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Área Jurídica</label>
              <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} className="input" placeholder="Ex: Trabalhista" />
            </div>
          </div>
          <div>
            <label className="label">Conteúdo <span className="text-gray-400 font-normal">(use {'{{nome}}'} para variáveis)</span></label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="input resize-none"
              rows={8}
              placeholder="Escreva o script aqui..."
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={() => mutation.mutate()} disabled={!form.title || !form.content} className="btn-primary flex-1">Salvar Script</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ScriptsPage() {
  const [category, setCategory] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [copied, setCopied] = useState(false)
  const qc = useQueryClient()

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ['scripts', category],
    queryFn: () => api.get(`/scripts${category ? `?category=${category}` : ''}`).then(r => r.data),
  })

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    qc.invalidateQueries({ queryKey: ['scripts'] })
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scripts de Atendimento</h1>
          <p className="text-sm text-gray-500 mt-0.5">Biblioteca de mensagens para todas as etapas</p>
        </div>
        <div className="flex items-center gap-3">
          {copied && <span className="text-sm text-green-600 font-medium">Copiado!</span>}
          <button onClick={() => setShowNew(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Novo Script
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCategory('')} className={`btn text-sm ${!category ? 'btn-primary' : 'btn-secondary'}`}>
          Todos
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setCategory(k)}
            className={`btn text-sm ${category === k ? 'btn-primary' : 'btn-secondary'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-gray-400">Carregando scripts...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scripts.map((s: any) => (
            <ScriptCard key={s.id} script={s} onCopy={handleCopy} />
          ))}
          {scripts.length === 0 && (
            <div className="col-span-2 card p-12 text-center text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              Nenhum script encontrado
            </div>
          )}
        </div>
      )}

      {showNew && <NewScriptModal onClose={() => { setShowNew(false); qc.invalidateQueries({ queryKey: ['scripts'] }) }} />}
    </div>
  )
}
