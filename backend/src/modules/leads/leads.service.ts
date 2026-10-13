import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SlaStatus } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters: any = {}) {
    const where: any = { tenantId, isActive: true };
    if (filters.stageId) where.stageId = filters.stageId;
    if (filters.pipelineId) where.pipelineId = filters.pipelineId;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.slaStatus) where.slaStatus = filters.slaStatus;
    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        stage: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        campaign: { select: { id: true, name: true } },
        _count: { select: { events: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.lead.findFirst({
      where: { tenantId, id },
      include: {
        stage: true,
        pipeline: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        campaign: true,
        events: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          include: { assignedTo: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(tenantId: string, userId: string, dto: any) {
    const existing = await this.prisma.lead.findFirst({
      where: { tenantId, phone: dto.phone },
    });
    if (existing) return { existing: true, lead: existing };

    const pipeline = await this.prisma.pipeline.findFirst({
      where: { tenantId, isDefault: true },
      include: { stages: { orderBy: { order: 'asc' } } },
    });

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        pipelineId: dto.pipelineId || pipeline.id,
        stageId: dto.stageId || pipeline.stages[0].id,
        assignedToId: dto.assignedToId || null,
        campaignId: dto.campaignId || null,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        bankWorked: dto.bankWorked,
        timeSinceDismissal: dto.timeSinceDismissal,
        pharmacyName: dto.pharmacyName,
        jobTitle: dto.jobTitle,
        market: dto.market,
        airlineName: dto.airlineName,
        empresa: dto.empresa,
        linkedinUrl: dto.linkedinUrl,
        niche: dto.niche,
        servidorPublico: dto.servidorPublico,
        consignadoAtivo: dto.consignadoAtivo,
        situacaoEmprestimo: dto.situacaoEmprestimo,
        aindaTrabalha: dto.aindaTrabalha,
        profissaoMaisTempo: dto.profissaoMaisTempo,
        estado: dto.estado,
        situacaoAtual: dto.situacaoAtual,
        tempoAcidente: dto.tempoAcidente,
        tipoAcidente: dto.tipoAcidente,
        melhorFormaContato: dto.melhorFormaContato,
        melhorPeriodoContato: dto.melhorPeriodoContato,
        empresaSabiaGravidez: dto.empresaSabiaGravidez,
        dataDemissao: dto.dataDemissao,
        situacaoCaso: dto.situacaoCaso,
        quandoProblema: dto.quandoProblema,
        situacaoAtualEmpresa: dto.situacaoAtualEmpresa,
        afastamentoInss: dto.afastamentoInss,
        situacaoDemissao: dto.situacaoDemissao,
        empresaConhecimento: dto.empresaConhecimento,
        tempoRetornoDemissao: dto.tempoRetornoDemissao,
        catEmitida: dto.catEmitida,
        limitacaoSequela: dto.limitacaoSequela,
        cidade: dto.cidade,
        urgencia: dto.urgencia,
        prontoContratar: dto.prontoContratar,
        possuiDocumento: dto.possuiDocumento,
        orderId: dto.orderId,
        produto: dto.produto,
        acaoAdvogado: dto.acaoAdvogado,
        tempoArea: dto.tempoArea,
        quantasPessoas: dto.quantasPessoas,
        operacao: dto.operacao,
        estagioOperacao: dto.estagioOperacao,
        possuiAtualmente: dto.possuiAtualmente,
        paisOrigemDestino: dto.paisOrigemDestino,
        especieNomeCientifico: dto.especieNomeCientifico,
        comoImovelAdquirido: dto.comoImovelAdquirido,
        qualProblemaImovel: dto.qualProblemaImovel,
        quandoPercebeuProblema: dto.quandoPercebeuProblema,
        ondeComprouVeiculo: dto.ondeComprouVeiculo,
        situacaoVeiculo: dto.situacaoVeiculo,
        tempoComprouVeiculo: dto.tempoComprouVeiculo,
        tentouResolverLoja: dto.tentouResolverLoja,
        rotaVoo: dto.rotaVoo,
        principalProblema: dto.principalProblema,
        consequenciaProblema: dto.consequenciaProblema,
        source: dto.source || 'linkedin',
        adName: dto.adName,
        formName: dto.formName,
        lgpdConsent: dto.lgpdConsent ?? true,
        notes: dto.notes,
      },
    });

    await this.prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        userId,
        type: 'CREATED',
        description: `Lead criado via ${dto.source || 'sistema'}`,
      },
    });

    return { existing: false, lead };
  }

  async update(tenantId: string, userId: string, id: string, dto: any) {
    const lead = await this.prisma.lead.findFirst({ where: { tenantId, id } });
    if (!lead) return null;

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        name: dto.name ?? lead.name,
        email: dto.email ?? lead.email,
        phone: dto.phone ?? lead.phone,
        bankWorked: dto.bankWorked ?? lead.bankWorked,
        timeSinceDismissal: dto.timeSinceDismissal ?? lead.timeSinceDismissal,
        pharmacyName: dto.pharmacyName ?? lead.pharmacyName,
        jobTitle: dto.jobTitle ?? lead.jobTitle,
        market: dto.market ?? lead.market,
        airlineName: dto.airlineName ?? lead.airlineName,
        empresa: dto.empresa ?? lead.empresa,
        linkedinUrl: dto.linkedinUrl ?? lead.linkedinUrl,
        niche: dto.niche ?? lead.niche,
        servidorPublico: dto.servidorPublico ?? lead.servidorPublico,
        consignadoAtivo: dto.consignadoAtivo ?? lead.consignadoAtivo,
        situacaoEmprestimo: dto.situacaoEmprestimo ?? lead.situacaoEmprestimo,
        aindaTrabalha: dto.aindaTrabalha ?? lead.aindaTrabalha,
        profissaoMaisTempo: dto.profissaoMaisTempo ?? lead.profissaoMaisTempo,
        estado: dto.estado ?? lead.estado,
        situacaoAtual: dto.situacaoAtual ?? lead.situacaoAtual,
        tempoAcidente: dto.tempoAcidente ?? lead.tempoAcidente,
        tipoAcidente: dto.tipoAcidente ?? lead.tipoAcidente,
        melhorFormaContato: dto.melhorFormaContato ?? lead.melhorFormaContato,
        melhorPeriodoContato: dto.melhorPeriodoContato ?? lead.melhorPeriodoContato,
        empresaSabiaGravidez: dto.empresaSabiaGravidez ?? lead.empresaSabiaGravidez,
        dataDemissao: dto.dataDemissao ?? lead.dataDemissao,
        situacaoCaso: dto.situacaoCaso ?? lead.situacaoCaso,
        quandoProblema: dto.quandoProblema ?? lead.quandoProblema,
        situacaoAtualEmpresa: dto.situacaoAtualEmpresa ?? lead.situacaoAtualEmpresa,
        afastamentoInss: dto.afastamentoInss ?? lead.afastamentoInss,
        situacaoDemissao: dto.situacaoDemissao ?? lead.situacaoDemissao,
        empresaConhecimento: dto.empresaConhecimento ?? lead.empresaConhecimento,
        tempoRetornoDemissao: dto.tempoRetornoDemissao ?? lead.tempoRetornoDemissao,
        catEmitida: dto.catEmitida ?? lead.catEmitida,
        limitacaoSequela: dto.limitacaoSequela ?? lead.limitacaoSequela,
        cidade: dto.cidade ?? lead.cidade,
        urgencia: dto.urgencia ?? lead.urgencia,
        prontoContratar: dto.prontoContratar ?? lead.prontoContratar,
        possuiDocumento: dto.possuiDocumento ?? lead.possuiDocumento,
        orderId: dto.orderId ?? lead.orderId,
        produto: dto.produto ?? lead.produto,
        acaoAdvogado: dto.acaoAdvogado ?? lead.acaoAdvogado,
        tempoArea: dto.tempoArea ?? lead.tempoArea,
        quantasPessoas: dto.quantasPessoas ?? lead.quantasPessoas,
        operacao: dto.operacao ?? lead.operacao,
        estagioOperacao: dto.estagioOperacao ?? lead.estagioOperacao,
        possuiAtualmente: dto.possuiAtualmente ?? lead.possuiAtualmente,
        paisOrigemDestino: dto.paisOrigemDestino ?? lead.paisOrigemDestino,
        especieNomeCientifico: dto.especieNomeCientifico ?? lead.especieNomeCientifico,
        comoImovelAdquirido: dto.comoImovelAdquirido ?? lead.comoImovelAdquirido,
        qualProblemaImovel: dto.qualProblemaImovel ?? lead.qualProblemaImovel,
        quandoPercebeuProblema: dto.quandoPercebeuProblema ?? lead.quandoPercebeuProblema,
        ondeComprouVeiculo: dto.ondeComprouVeiculo ?? lead.ondeComprouVeiculo,
        situacaoVeiculo: dto.situacaoVeiculo ?? lead.situacaoVeiculo,
        tempoComprouVeiculo: dto.tempoComprouVeiculo ?? lead.tempoComprouVeiculo,
        tentouResolverLoja: dto.tentouResolverLoja ?? lead.tentouResolverLoja,
        rotaVoo: dto.rotaVoo ?? lead.rotaVoo,
        principalProblema: dto.principalProblema ?? lead.principalProblema,
        consequenciaProblema: dto.consequenciaProblema ?? lead.consequenciaProblema,
        quemDesenvolver: dto.quemDesenvolver ?? lead.quemDesenvolver,
        desafioComercial: dto.desafioComercial ?? lead.desafioComercial,
        disponibilidadeAlphaville: dto.disponibilidadeAlphaville ?? lead.disponibilidadeAlphaville,
        assignedToId: dto.assignedToId !== undefined ? dto.assignedToId : lead.assignedToId,
        campaignId: dto.campaignId !== undefined ? dto.campaignId : lead.campaignId,
        notes: dto.notes ?? lead.notes,
        tags: dto.tags ?? lead.tags,
      },
    });

    return updated;
  }

  async moveStage(tenantId: string, userId: string, leadId: string, stageId: string) {
    const lead = await this.prisma.lead.findFirst({ where: { tenantId, id: leadId }, include: { stage: true } });
    if (!lead) return null;

    const newStage = await this.prisma.stage.findUnique({ where: { id: stageId } });

    const updated = await this.prisma.lead.update({
      where: { id: leadId },
      data: { stageId },
    });

    await this.prisma.leadEvent.create({
      data: {
        leadId,
        userId,
        type: 'STAGE_CHANGED',
        description: `Movido de "${lead.stage.name}" para "${newStage.name}"`,
        metadata: { from: lead.stageId, to: stageId },
      },
    });

    return updated;
  }

  async addNote(tenantId: string, userId: string, leadId: string, note: string) {
    await this.prisma.leadEvent.create({
      data: {
        leadId,
        userId,
        type: 'NOTE_ADDED',
        description: note,
      },
    });
    return { success: true };
  }

  async registerWhatsappContact(tenantId: string, userId: string, leadId: string) {
    const lead = await this.prisma.lead.findFirst({ where: { tenantId, id: leadId } });
    if (!lead) return null;

    const now = new Date();
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        lastContactAt: now,
        firstContactAt: lead.firstContactAt ?? now,
        slaStatus: SlaStatus.OK,
      },
    });

    await this.prisma.leadEvent.create({
      data: {
        leadId,
        userId,
        type: 'WHATSAPP_SENT',
        description: 'Contato via WhatsApp iniciado',
      },
    });

    return { success: true };
  }

  async remove(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { tenantId, id } });
    if (!lead) return null;
    await this.prisma.leadEvent.deleteMany({ where: { leadId: id } });
    await this.prisma.task.deleteMany({ where: { leadId: id } });
    await this.prisma.lead.delete({ where: { id } });
    return { success: true };
  }

  async getKanban(tenantId: string, pipelineId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { tenantId, id: pipelineId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            leads: {
              where: { isActive: true },
              include: {
                assignedTo: { select: { id: true, name: true } },
                campaign: { select: { id: true, name: true } },
                _count: { select: { tasks: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
    return pipeline;
  }
}
