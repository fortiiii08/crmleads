import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(user: any): Promise<{
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
    getByCampaign(user: any): Promise<{
        id: string;
        name: string;
        source: string;
        budget: number;
        totalLeads: number;
        qualified: number;
        closed: number;
        cpl: string;
    }[]>;
    getByAgent(user: any): Promise<{
        id: string;
        name: string;
        totalLeads: number;
        qualified: number;
        closed: number;
        slaOk: number;
        slaOverdue: number;
        conversionRate: string;
    }[]>;
    getByDay(user: any, days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
}
