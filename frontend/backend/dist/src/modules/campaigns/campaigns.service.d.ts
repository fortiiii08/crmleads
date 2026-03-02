import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CampaignsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<({
        _count: {
            leads: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        source: string;
        budget: number | null;
        startDate: Date | null;
        endDate: Date | null;
    })[]>;
    create(tenantId: string, dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        source: string;
        budget: number | null;
        startDate: Date | null;
        endDate: Date | null;
    }>;
}
