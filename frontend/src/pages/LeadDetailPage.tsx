import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../lib/api'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft, MessageCircle, Phone, Mail, Building2, Clock,
  CheckSquare, FileText, ChevronRight, User, Tag, Send,
  Plus, Calendar, AlertTriangle, Trash2
} from 'lucide-react'

const EVENT_ICONS: Record<string, any> = {
  CREATED: { icon: Plus, color: 'text-indigo-500 bg-indigo-50' },
  STAGE_CHANGED: { icon: ChevronRight, color: 'text-blue-500 bg-blue-50' },
  WHATSAPP_SENT: { icon: MessageCircle, color: 'text-green-500 bg-green-50' },
  NOTE_ADDED: { icon: FileText, color: 'text-gray-500 bg-gray-50' },
  TASK_CREATED: { icon: CheckSquare, color: 'text-purple-500 bg-purple-50' },
  TASK_COMPLETED: { icon: CheckSquare, color: 'text-green-500 bg-green-50' },
  SLA_WARNING: { icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-50' },
  SLA_OVERDUE: { icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
  ASSIGNED: { icon: User, color: 'text-blue-500 bg-blue-50' },
  SCRIPT_USED: { icon: FileText, color: 'text-indigo-500 bg-indigo-50' },
}

function ScriptModal({ lead, onClose }: { lead: any; onClose: () => void }) {
  const [selected, setSelected] = useState<any>(null)
  const [preview, setPreview] = useState('')

  const { data: scripts = [] } = useQuery({
    queryKey: ['scripts'],
    queryFn: () => api.get('/scripts').then(r => r.data),
  })

  const selectScript = (s: any) => {
    setSelected(s)
    let content = s.content
    content = content.replace(/\{\{nome\}\}/g, lead.name)
    setPreview(content)
  }

  const copy = () => {
    navigator.clipboard.writeText(preview)
    api.post(`/scripts/${selected.id}/use`)
    api.post(`/leads/${lead.id}/whatsapp`)
    onClose()
  }

  const categories: Record<string, string> = {
    FIRST_CONTACT: 'Primeiro Contato', QUALIFICATION: 'Qualificação', FOLLOW_UP: 'Follow-up',
    SCHEDULING: 'Agendamento', REACTIVATION: 'Reativação', PROPOSAL: 'Proposta', CLOSING: 'Fechamento',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">Scripts de Atendimento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 border-r border-gray-100 overflow-y-auto p-3 space-y-1">
            {scripts.map((s: any) => (
              <button
                key={s.id}
                onClick={() => selectScript(s)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${selected?.id === s.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <p className="font-medium leading-tight">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{categories[s.category]}</p>
              </button>
            ))}
          </div>
          <div className="flex-1 p-5 flex flex-col">
            {selected ? (
              <>
                <p className="text-sm font-medium text-gray-700 mb-2">Preview para {lead.name}:</p>
                <textarea
                  value={preview}
                  onChange={e => setPreview(e.target.value)}
                  className="flex-1 input resize-none font-mono text-sm leading-relaxed"
                  rows={12}
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={copy} className="btn-primary flex-1">
                    <Send className="w-4 h-4" />
                    Copiar e Registrar Contato
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Selecione um script ao lado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')
  const [showScript, setShowScript] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [showTask, setShowTask] = useState(false)

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => api.get(`/leads/${id}`).then(r => r.data),
  })

  const { data: pipelines = [] } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => api.get('/pipelines').then(r => r.data),
  })

  const noteMutation = useMutation({
    mutationFn: () => api.post(`/leads/${id}/notes`, { note }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lead', id] }); setNote('') },
  })

  const stageMutation = useMutation({
    mutationFn: (stageId: string) => api.patch(`/leads/${id}/stage`, { stageId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead', id] }),
  })

  const taskMutation = useMutation({
    mutationFn: () => api.post('/tasks', { leadId: id, title: taskTitle }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lead', id] }); setTaskTitle(''); setShowTask(false) },
  })

  const whatsappMutation = useMutation({
    mutationFn: () => api.post(`/leads/${id}/whatsapp`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/leads/${id}`),
    onSuccess: () => navigate('/leads'),
  })

  const handleDelete = () => {
    if (confirm(`Remover o lead "${lead?.name}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) return <div className="p-6 text-gray-500">Carregando...</div>
  if (!lead) return <div className="p-6 text-gray-500">Lead não encontrado</div>

  const phone = lead.phone?.replace(/\D/g, '')
  const waLink = `https://wa.me/55${phone}?text=${encodeURIComponent(`Olá ${lead.name}, tudo bem?`)}`

  const allStages = pipelines.find((p: any) => p.id === lead.pipelineId)?.stages || []

  const slaColors: Record<string, string> = {
    OK: 'bg-green-100 text-green-700',
    WARNING: 'bg-yellow-100 text-yellow-700',
    CRITICAL: 'bg-orange-100 text-orange-700',
    OVERDUE: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-5 -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`badge ${slaColors[lead.slaStatus]}`}>{lead.slaStatus}</span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lead.stage?.color }} />
                    {lead.stage?.name}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setShowScript(true); window.open(waLink, '_blank'); whatsappMutation.mutate() }}
                  className="btn bg-green-600 text-white hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button onClick={() => setShowScript(true)} className="btn-secondary">
                  <FileText className="w-4 h-4" />
                  Scripts
                </button>
                <button onClick={handleDelete} className="btn-danger">
                  <Trash2 className="w-4 h-4" />
                  Remover
                </button>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Mover Etapa</h3>
            <div className="flex flex-wrap gap-2">
              {allStages.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => stageMutation.mutate(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    lead.stageId === s.id
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                  style={lead.stageId === s.id ? { backgroundColor: s.color } : {}}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              {(lead.events || []).map((ev: any) => {
                const cfg = EVENT_ICONS[ev.type] || EVENT_ICONS.NOTE_ADDED
                const Icon = cfg.icon
                return (
                  <div key={ev.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm text-gray-800">{ev.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ev.user?.name && <span>{ev.user.name} · </span>}
                        {formatDistanceToNow(new Date(ev.createdAt), { locale: ptBR, addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Adicionar observação..."
                className="input resize-none"
                rows={3}
              />
              <button
                onClick={() => noteMutation.mutate()}
                disabled={!note.trim()}
                className="btn-primary mt-2"
              >
                <Send className="w-4 h-4" />
                Adicionar Nota
              </button>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tarefas</h3>
              <button onClick={() => setShowTask(!showTask)} className="btn-secondary text-xs">
                <Plus className="w-3 h-3" />
                Nova Tarefa
              </button>
            </div>
            {showTask && (
              <div className="flex gap-2 mb-4">
                <input
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Título da tarefa..."
                  className="input flex-1"
                />
                <button onClick={() => taskMutation.mutate()} disabled={!taskTitle} className="btn-primary">Criar</button>
              </div>
            )}
            <div className="space-y-2">
              {(lead.tasks || []).map((task: any) => (
                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border ${task.status === 'COMPLETED' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'}`}>
                  <CheckSquare className={`w-4 h-4 ${task.status === 'COMPLETED' ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={`flex-1 text-sm ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </span>
                  <span className="text-xs text-gray-400">{task.priority}</span>
                </div>
              ))}
              {(lead.tasks || []).length === 0 && <p className="text-sm text-gray-400">Nenhuma tarefa</p>}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Informações</h3>
            <InfoItem icon={Phone} label="Telefone" value={lead.phone} />
            <InfoItem icon={Mail} label="E-mail" value={lead.email} />
            <InfoItem icon={Building2} label="Empresa" value={(lead as any).empresa || (lead as any).company} />
            <InfoItem icon={Building2} label="Cargo" value={(lead as any).cargo || lead.jobTitle} />
            <InfoItem icon={Building2} label="Banco" value={lead.bankWorked} />
            <InfoItem icon={Clock} label="Desligamento" value={lead.timeSinceDismissal} />
            <InfoItem icon={Building2} label="Farmácia" value={lead.pharmacyName} />
            <InfoItem icon={Tag} label="Mercado" value={lead.market} />
            <InfoItem icon={Building2} label="Companhia Aérea" value={(lead as any).airlineName} />
            <InfoItem icon={Tag} label="Nicho" value={(lead as any).niche} />
            <InfoItem icon={Tag} label="Servidor(a) público?" value={(lead as any).servidorPublico} />
            <InfoItem icon={Tag} label="Consignado ativo?" value={(lead as any).consignadoAtivo} />
            <InfoItem icon={Tag} label="Situação no empréstimo" value={(lead as any).situacaoEmprestimo} />
            <InfoItem icon={Tag} label="Ainda trabalha na empresa?" value={(lead as any).aindaTrabalha} />
            <InfoItem icon={Tag} label="Profissão/área por mais tempo" value={(lead as any).profissaoMaisTempo} />
            <InfoItem icon={Tag} label="Empresa" value={(lead as any).empresa} />
            <InfoItem icon={Tag} label="Estado" value={(lead as any).estado} />
            <InfoItem icon={Tag} label="Situação a analisar" value={(lead as any).situacaoAnalisar} />
            <InfoItem icon={Tag} label="Situação atual" value={(lead as any).situacaoAtual} />
            <InfoItem icon={Calendar} label="Vínculo terminou" value={(lead as any).vinculoTerminou} />
            <InfoItem icon={Clock} label="Tempo na empresa" value={(lead as any).tempoTrabalho} />
            <InfoItem icon={FileText} label="Tipo de contratação" value={(lead as any).tipoContratacao} />
            <InfoItem icon={Tag} label="Possui documentos?" value={(lead as any).possuiDocumentos} />
            <InfoItem icon={User} label="Acompanhado por advogado?" value={(lead as any).acompanhadoAdvogado} />
            <InfoItem icon={Tag} label="Problema na viagem" value={(lead as any).problemaViagem} />
            <InfoItem icon={Calendar} label="Quando o problema aconteceu" value={(lead as any).quandoProblema} />
            <InfoItem icon={Tag} label="Tipo de voo" value={(lead as any).tipoVoo} />
            <InfoItem icon={Clock} label="Atraso no destino" value={(lead as any).atrasoTempo} />
            <InfoItem icon={Tag} label="Suporte da companhia aérea" value={(lead as any).suporteAerea} />
            <InfoItem icon={Tag} label="Consequência do problema" value={(lead as any).consequenciaProblema} />
            <InfoItem icon={FileText} label="Documentos do ocorrido" value={(lead as any).documentosAereo} />
            <InfoItem icon={Tag} label="Acidente há mais de dois anos?" value={(lead as any).tempoAcidente} />
            <InfoItem icon={Tag} label="Tipo de acidente" value={(lead as any).tipoAcidente} />
            <InfoItem icon={Tag} label="Melhor forma de contato" value={(lead as any).melhorFormaContato} />
            <InfoItem icon={Tag} label="Melhor período para contato" value={(lead as any).melhorPeriodoContato} />
            <InfoItem icon={Tag} label="Empresa sabia da gravidez?" value={(lead as any).empresaSabiaGravidez} />
            <InfoItem icon={Calendar} label="Data da demissão" value={(lead as any).dataDemissao} />
            <InfoItem icon={Tag} label="Qual situação está relacionada ao seu caso?" value={(lead as any).situacaoCaso} />
            <InfoItem icon={Calendar} label="Quando aconteceu ou começou o problema?" value={(lead as any).quandoProblema} />
            <InfoItem icon={Tag} label="Qual é a sua situação atual na empresa?" value={(lead as any).situacaoAtualEmpresa} />
            <InfoItem icon={Tag} label="Houve afastamento ou benefício pelo INSS?" value={(lead as any).afastamentoInss} />
            <InfoItem icon={Tag} label="Em qual situação aconteceu a sua demissão?" value={(lead as any).situacaoDemissao} />
            <InfoItem icon={Tag} label="A empresa tinha conhecimento do tratamento/afastamento?" value={(lead as any).empresaConhecimento} />
            <InfoItem icon={Tag} label="Quanto tempo depois do retorno aconteceu a demissão?" value={(lead as any).tempoRetornoDemissao} />
            <InfoItem icon={Tag} label="Foi emitida uma CAT?" value={(lead as any).catEmitida} />
            <InfoItem icon={Tag} label="O problema deixou alguma limitação ou sequela?" value={(lead as any).limitacaoSequela} />
            <InfoItem icon={Tag} label="Cidade" value={(lead as any).cidade} />
            <InfoItem icon={Tag} label="Qual é a sua situação atual?" value={(lead as any).situacaoAtual} />
            <InfoItem icon={Tag} label="Existe alguma urgência?" value={(lead as any).urgencia} />
            <InfoItem icon={Tag} label="Pronto para contratar?" value={(lead as any).prontoContratar} />
            <InfoItem icon={Tag} label="Possui documento ou prova?" value={(lead as any).possuiDocumento} />
            <InfoItem icon={Tag} label="Já entrou com ação com advogado?" value={(lead as any).acaoAdvogado} />
            <InfoItem icon={Tag} label="Há quanto tempo trabalha nessa área?" value={(lead as any).tempoNaArea} />
            <InfoItem icon={Tag} label="Em qual fase está?" value={(lead as any).faseAtual} />
            <InfoItem icon={Tag} label="Em qual fase está o processo?" value={(lead as any).faseProcesso} />
            <InfoItem icon={Tag} label="O que você possui?" value={(lead as any).oQuePossui} />
            <InfoItem icon={Tag} label="O que você possui? (novo)" value={(lead as any).oquePossui} />
            <InfoItem icon={Tag} label="Existe prazo em andamento?" value={(lead as any).prazoAndamento} />
            <InfoItem icon={Tag} label="Situação" value={(lead as any).situacao} />
            <InfoItem icon={Tag} label="Quantas pessoas lidera/liderou?" value={(lead as any).quantasPessoas} />
            {(lead as any).notes && (
              <div>
                <p className="text-xs text-gray-400">Mensagem / Observações</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{(lead as any).notes}</p>
              </div>
            )}
            {(lead as any).linkedinUrl && (
              <div>
                <p className="text-xs text-gray-400">LinkedIn</p>
                <a href={(lead as any).linkedinUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                  {(lead as any).linkedinUrl}
                </a>
              </div>
            )}
            <InfoItem icon={Tag} label="Order ID" value={(lead as any).orderId} />
            <InfoItem icon={Tag} label="Produto" value={(lead as any).produto} />
            <InfoItem icon={Tag} label="Ação do Advogado" value={(lead as any).acaoAdvogado} />
            <InfoItem icon={Tag} label="Tempo na Área" value={(lead as any).tempoArea} />
            <InfoItem icon={Tag} label="Quantas Pessoas" value={(lead as any).quantasPessoas} />
            <InfoItem icon={Tag} label="Faturamento do escritório" value={(lead as any).faturamento} />
            <InfoItem icon={Tag} label="Investe em marketing?" value={(lead as any).marketing} />
            <InfoItem icon={Tag} label="Tipo de fraude" value={(lead as any).tipoFraude} />
            <InfoItem icon={Tag} label="Quando percebeu o golpe?" value={(lead as any).quandoPercebeuGolpe} />
            <InfoItem icon={Tag} label="Como o imóvel foi adquirido?" value={(lead as any).comoImovelAdquirido} />
            <InfoItem icon={Tag} label="Qual problema você está enfrentando?" value={(lead as any).qualProblemaImovel} />
            <InfoItem icon={Tag} label="Quando você percebeu o problema?" value={(lead as any).quandoPercebeuProblema} />
            <InfoItem icon={Tag} label="Operação pretendida" value={(lead as any).operacao} />
            <InfoItem icon={Tag} label="Estágio da operação" value={(lead as any).estagioOperacao} />
            <InfoItem icon={Tag} label="O que já possui" value={(lead as any).possuiAtualmente} />
            <InfoItem icon={Tag} label="País origem/destino" value={(lead as any).paisOrigemDestino} />
            <InfoItem icon={Tag} label="Espécie / nome científico" value={(lead as any).especieNomeCientifico} />
            <InfoItem icon={Tag} label="Rota do voo (origem / destino)" value={(lead as any).rotaVoo} />
            <InfoItem icon={Tag} label="Qual foi o principal problema?" value={(lead as any).principalProblema} />
            <InfoItem icon={Tag} label="Qual foi a principal consequência?" value={(lead as any).consequenciaProblema} />
            <InfoItem icon={Tag} label="Onde você comprou o veículo?" value={(lead as any).ondeComprouVeiculo} />
            <InfoItem icon={Tag} label="Qual situação aconteceu com o veículo?" value={(lead as any).situacaoVeiculo} />
            <InfoItem icon={Tag} label="Há quanto tempo comprou o veículo?" value={(lead as any).tempoComprouVeiculo} />
            <InfoItem icon={Tag} label="Tentou resolver com a loja/revendedora?" value={(lead as any).tentouResolverLoja} />
            <InfoItem icon={Tag} label="Valor aproximado" value={(lead as any).valorAproximado} />
            <InfoItem icon={Tag} label="Qual é a sua situação? (OAB)" value={(lead as any).oabNotification} />
            <InfoItem icon={Tag} label="O que você pretende? (OAB)" value={(lead as any).oabObjective} />
            <InfoItem icon={Tag} label="Número OAB" value={(lead as any).oabNumber} />
            <InfoItem icon={Tag} label="Suspensão OAB" value={(lead as any).oabSuspension} />
            <InfoItem icon={Tag} label="Quem deseja desenvolver no treinamento?" value={(lead as any).quemDesenvolver} />
            <InfoItem icon={Tag} label="Principal desafio comercial do escritório" value={(lead as any).desafioComercial} />
            <InfoItem icon={Tag} label="Disponibilidade Alphaville 16/11?" value={(lead as any).disponibilidadeAlphaville} />
            <InfoItem icon={Tag} label="Órgão envolvido" value={(lead as any).orgaoEnvolvido} />
            <InfoItem icon={Tag} label="Atividade principal" value={(lead as any).atividadePrincipal} />
            <InfoItem icon={Tag} label="Razão social / nome fantasia" value={(lead as any).razaoSocial} />
            <InfoItem icon={Tag} label="Origem" value={lead.source} />
            <InfoItem icon={Tag} label="Campanha" value={lead.campaign?.name} />
            <InfoItem icon={Tag} label="Anúncio" value={lead.adName} />
            <InfoItem icon={Tag} label="Formulário" value={lead.formName} />
            <InfoItem icon={User} label="Responsável" value={lead.assignedTo?.name} />
            <div>
              <p className="text-xs text-gray-400">Data de entrada</p>
              <p className="text-sm text-gray-800">
                {format(new Date(lead.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">LGPD</p>
              <span className={`badge ${lead.lgpdConsent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {lead.lgpdConsent ? 'Consentimento OK' : 'Sem consentimento'}
              </span>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Ações Rápidas</h3>
            <div className="space-y-2">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => whatsappMutation.mutate()}
                className="flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Abrir WhatsApp</span>
              </a>
              <button
                onClick={() => setShowScript(true)}
                className="flex w-full items-center gap-3 p-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Ver Scripts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showScript && <ScriptModal lead={lead} onClose={() => setShowScript(false)} />}
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </p>
      <p className="text-sm text-gray-800 mt-0.5">{value}</p>
    </div>
  )
}
