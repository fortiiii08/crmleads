import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(user: any): Promise<({
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
    create(user: any, dto: any): Promise<{
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
