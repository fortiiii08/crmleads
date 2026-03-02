import { PrismaService } from '../../common/prisma/prisma.service';
export declare class SlaService {
    private prisma;
    constructor(prisma: PrismaService);
    checkSla(): Promise<void>;
    getSlaStats(tenantId: string): Promise<{
        ok: number;
        warning: number;
        critical: number;
        overdue: number;
    }>;
}
