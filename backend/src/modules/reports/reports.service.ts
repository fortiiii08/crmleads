import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(tenantId: string, from?: string, to?: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr + 'T00:00:00.000Z');

    const dateFilter = this.buildDateFilter(from, to);
    const hasDateFilter = !!dateFilter;

    const [
      totalLeads,
      leadsToday,
      clientesFechados,
      leadsPeridos,
      avgFirstContact,
      slaStats,
    ] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, isActive: true, ...(hasDateFilter && { createdAt: dateFilter }) } }),
      this.prisma.lead.count({ where: { tenantId, createdAt: hasDateFilter ? dateFilter : { gte: today } } }),
      this.prisma.lead.count({ where: { tenantId, stage: { isWon: true }, ...(hasDateFilter && { createdAt: dateFilter }) } }),
      this.prisma.lead.count({ where: { tenantId, stage: { isLost: true }, ...(hasDateFilter && { createdAt: dateFilter }) } }),
      this.getAvgFirstContactTime(tenantId, dateFilter),
      this.getSlaBreakdown(tenantId, dateFilter),
    ]);

    return {
      totalLeads,
      leadsToday,
      clientesFechados,
      leadsPeridos,
      taxaFechamento: totalLeads > 0 ? ((clientesFechados / totalLeads) * 100).toFixed(1) : '0',
      avgFirstContactMinutes: avgFirstContact,
      sla: slaStats,
    };
  }

  async getLeadsByCampaign(tenantId: string) {
    const campaigns = await this.prisma.campaign.findMany({
      where: { tenantId },
      include: {
        leads: {
          include: { stage: true },
        },
      },
    });

    return campaigns.map(c => ({
      id: c.id,
      name: c.name,
      source: c.source,
      budget: c.budget,
      totalLeads: c.leads.length,
      qualified: c.leads.filter(l => l.stage.order >= 5).length,
      closed: c.leads.filter(l => l.stage.isWon).length,
      cpl: c.budget && c.leads.length > 0 ? (c.budget / c.leads.length).toFixed(2) : null,
    }));
  }

  async getLeadsByAgent(tenantId: string, from?: string, to?: string) {
    const dateFilter = this.buildDateFilter(from, to);
    const leadsWhere = dateFilter ? { createdAt: dateFilter } : {};

    const agents = await this.prisma.user.findMany({
      where: { tenantId, isActive: true },
      include: {
        leads: {
          where: leadsWhere,
          include: { stage: true },
        },
      },
    });

    return agents.map(a => ({
      id: a.id,
      name: a.name,
      totalLeads: a.leads.length,
      qualified: a.leads.filter(l => l.stage.order >= 5).length,
      closed: a.leads.filter(l => l.stage.isWon).length,
      slaOk: a.leads.filter(l => l.slaStatus === 'OK').length,
      slaOverdue: a.leads.filter(l => l.slaStatus === 'OVERDUE').length,
      conversionRate: a.leads.length > 0
        ? ((a.leads.filter(l => l.stage.isWon).length / a.leads.length) * 100).toFixed(1)
        : '0',
    }));
  }

  async getLeadsByDay(tenantId: string, from?: string, to?: string, days: number = 14) {
    const createdAt: any = {};

    if (from) {
      createdAt.gte = new Date(from + 'T00:00:00.000Z');
    } else {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - days);
      d.setUTCHours(0, 0, 0, 0);
      createdAt.gte = d;
    }

    if (to) {
      createdAt.lte = new Date(to + 'T23:59:59.999Z');
    }

    const leads = await this.prisma.lead.findMany({
      where: { tenantId, createdAt },
      select: { createdAt: true },
    });

    // Preenche todos os dias do intervalo com 0, e soma os leads
    const grouped: Record<string, number> = {};

    // Monta série completa do from até to
    const start = createdAt.gte as Date;
    const end = createdAt.lte ?? new Date();
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      grouped[d.toISOString().split('T')[0]] = 0;
    }

    for (const lead of leads) {
      const day = lead.createdAt.toISOString().split('T')[0];
      if (day in grouped) grouped[day]++;
    }

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private buildDateFilter(from?: string, to?: string): any {
    if (!from && !to) return null;
    const filter: any = {};
    if (from) filter.gte = new Date(from + 'T00:00:00.000Z');
    if (to)   filter.lte = new Date(to   + 'T23:59:59.999Z');
    return filter;
  }

  private async getAvgFirstContactTime(tenantId: string, dateFilter?: any): Promise<number | null> {
    const leads = await this.prisma.lead.findMany({
      where: { tenantId, firstContactAt: { not: null }, ...(dateFilter && { createdAt: dateFilter }) },
      select: { createdAt: true, firstContactAt: true },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    if (leads.length === 0) return null;

    const avg = leads.reduce((sum, l) => {
      const diff = (l.firstContactAt.getTime() - l.createdAt.getTime()) / 60000;
      return sum + diff;
    }, 0) / leads.length;

    return Math.round(avg);
  }

  private async getSlaBreakdown(tenantId: string, dateFilter?: any) {
    const extra = dateFilter ? { createdAt: dateFilter } : {};
    const [ok, warning, critical, overdue] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'OK', isActive: true, firstContactAt: null, ...extra } }),
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'WARNING', isActive: true, ...extra } }),
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'CRITICAL', isActive: true, ...extra } }),
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'OVERDUE', isActive: true, ...extra } }),
    ]);
    return { ok, warning, critical, overdue };
  }
}
