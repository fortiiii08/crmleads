import { PrismaService } from '../../common/prisma/prisma.service';
export declare class WebhooksService {
    private prisma;
    constructor(prisma: PrismaService);
    receiveLinkedIn(tenantSlug: string, payload: any): Promise<{
        error: string;
        duplicate?: undefined;
        leadId?: undefined;
        success?: undefined;
    } | {
        duplicate: boolean;
        leadId: string;
        error?: undefined;
        success?: undefined;
    } | {
        success: boolean;
        leadId: string;
        error?: undefined;
        duplicate?: undefined;
    }>;
}
