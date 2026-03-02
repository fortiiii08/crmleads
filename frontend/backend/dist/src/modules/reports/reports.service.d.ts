import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(tenantId: string): Promise<{
        totalLeads: number;
        leadsToday: number;
        clientesFechados: number;
        leadsPeridos: number;
        taxaFechamento: string;
        avgFirstContactMinutes: number;
        sla: {
            ok: number;
            warning: number;
            critical: number;
            overdue: number;
        };
    }>;
    getLeadsByCampaign(tenantId: string): Promise<{
        id: string;
        name: string;
        source: string;
        budget: number;
        totalLeads: number;
        qualified: number;
        closed: number;
        cpl: string;
    }[]>;
    getLeadsByAgent(tenantId: string): Promise<{
        id: string;
        name: string;
        totalLeads: number;
        qualified: number;
        closed: number;
        slaOk: number;
        slaOverdue: number;
        conversionRate: string;
    }[]>;
    getLeadsByDay(tenantId: string, days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    private getAvgFirstContactTime;
    private getSlaBreakdown;
}
