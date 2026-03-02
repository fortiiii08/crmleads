import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      leadsToday,
      clientesFechados,
      leadsPeridos,
      avgFirstContact,
      slaStats,
    ] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, isActive: true } }),
      this.prisma.lead.count({ where: { tenantId, createdAt: { gte: today } } }),
      this.prisma.lead.count({ where: { tenantId, stage: { isWon: true } } }),
      this.prisma.lead.count({ where: { tenantId, stage: { isLost: true } } }),
      this.getAvgFirstContactTime(tenantId),
      this.getSlaBreakdown(tenantId),
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

  async getLeadsByAgent(tenantId: string) {
    const agents = await this.prisma.user.findMany({
      where: { tenantId, isActive: true },
      include: {
        leads: {
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

  async getLeadsByDay(tenantId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const leads = await this.prisma.lead.findMany({
      where: { tenantId, createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    const grouped: Record<string, number> = {};
    for (const lead of leads) {
      const day = lead.createdAt.toISOString().split('T')[0];
      grouped[day] = (grouped[day] || 0) + 1;
    }

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getAvgFirstContactTime(tenantId: string): Promise<number | null> {
    const leads = await this.prisma.lead.findMany({
      where: { tenantId, firstContactAt: { not: null } },
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

  private async getSlaBreakdown(tenantId: string) {
    const [ok, warning, critical, overdue] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'OK', isActive: true, firstContactAt: null } }),
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'WARNING', isActive: true } }),
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'CRITICAL', isActive: true } }),
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'OVERDUE', isActive: true } }),
    ]);
    return { ok, warning, critical, overdue };
  }
}
