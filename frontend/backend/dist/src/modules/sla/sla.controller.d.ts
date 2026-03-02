import { SlaService } from './sla.service';
export declare class SlaController {
    private slaService;
    constructor(slaService: SlaService);
    getStats(user: any): Promise<{
        ok: number;
        warning: number;
        critical: number;
        overdue: number;
    }>;
}
