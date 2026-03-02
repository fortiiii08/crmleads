import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async receiveLinkedIn(tenantSlug: string, payload: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) return { error: 'Tenant não encontrado' };

    const pipeline = await this.prisma.pipeline.findFirst({
      where: { tenantId: tenant.id, isDefault: true },
      include: { stages: { orderBy: { order: 'asc' } } },
    });

    const phone = payload.phone || payload.telefone || payload['li:phone'] || '';
    const email = payload.email || payload['li:email'] || '';
    const name = payload.name || payload.nome || payload['li:firstName'] + ' ' + payload['li:lastName'] || 'Lead LinkedIn';

    const existing = await this.prisma.lead.findFirst({ where: { tenantId: tenant.id, phone } });
    if (existing) return { duplicate: true, leadId: existing.id };

    const lead = await this.prisma.lead.create({
      data: {
        tenantId: tenant.id,
        pipelineId: pipeline.id,
        stageId: pipeline.stages[0].id,
        name: name.trim(),
        email,
        phone,
        bankWorked: payload.banco || payload.bankWorked || '',
        timeSinceDismissal: payload.tempoDesligamento || payload.timeSinceDismissal || '',
        source: 'linkedin',
        adName: payload.adName || payload.anuncio || '',
        formName: payload.formName || payload.formulario || '',
        lgpdConsent: true,
      },
    });

    await this.prisma.leadEvent.create({
      data: { leadId: lead.id, type: 'CREATED', description: 'Lead recebido via webhook LinkedIn/Pluga' },
    });

    return { success: true, leadId: lead.id };
  }
}
