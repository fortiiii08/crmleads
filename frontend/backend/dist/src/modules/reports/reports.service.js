"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(tenantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalLeads, leadsToday, clientesFechados, leadsPeridos, avgFirstContact, slaStats,] = await Promise.all([
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
    async getLeadsByCampaign(tenantId) {
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
    async getLeadsByAgent(tenantId) {
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
    async getLeadsByDay(tenantId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const leads = await this.prisma.lead.findMany({
            where: { tenantId, createdAt: { gte: startDate } },
            select: { createdAt: true },
        });
        const grouped = {};
        for (const lead of leads) {
            const day = lead.createdAt.toISOString().split('T')[0];
            grouped[day] = (grouped[day] || 0) + 1;
        }
        return Object.entries(grouped)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    async getAvgFirstContactTime(tenantId) {
        const leads = await this.prisma.lead.findMany({
            where: { tenantId, firstContactAt: { not: null } },
            select: { createdAt: true, firstContactAt: true },
            take: 100,
            orderBy: { createdAt: 'desc' },
        });
        if (leads.length === 0)
            return null;
        const avg = leads.reduce((sum, l) => {
            const diff = (l.firstContactAt.getTime() - l.createdAt.getTime()) / 60000;
            return sum + diff;
        }, 0) / leads.length;
        return Math.round(avg);
    }
    async getSlaBreakdown(tenantId) {
        const [ok, warning, critical, overdue] = await Promise.all([
            this.prisma.lead.count({ where: { tenantId, slaStatus: 'OK', isActive: true, firstContactAt: null } }),
            this.prisma.lead.count({ where: { tenantId, slaStatus: 'WARNING', isActive: true } }),
            this.prisma.lead.count({ where: { tenantId, slaStatus: 'CRITICAL', isActive: true } }),
            this.prisma.lead.count({ where: { tenantId, slaStatus: 'OVERDUE', isActive: true } }),
        ]);
        return { ok, warning, critical, overdue };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map