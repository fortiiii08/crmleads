import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private webhooksService;
    constructor(webhooksService: WebhooksService);
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
