import { PrismaService } from '../../common/prisma/prisma.service';
export declare class LeadsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, filters?: any): Promise<({
        stage: {
            id: string;
            name: string;
            createdAt: Date;
            isLost: boolean;
            isWon: boolean;
            pipelineId: string;
            color: string;
            order: number;
            autoRules: import("@prisma/client/runtime/library").JsonValue | null;
        };
        campaign: {
            id: string;
            name: string;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
        };
        _count: {
            tasks: number;
            events: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        isActive: boolean;
        pipelineId: string;
        source: string;
        phone: string;
        bankWorked: string | null;
        timeSinceDismissal: string | null;
        adName: string | null;
        formName: string | null;
        lgpdConsent: boolean;
        slaStatus: import(".prisma/client").$Enums.SlaStatus;
        firstContactAt: Date | null;
        lastContactAt: Date | null;
        notes: string | null;
        tags: string[];
        stageId: string;
        assignedToId: string | null;
        campaignId: string | null;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        tasks: ({
            assignedTo: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            title: string;
            assignedToId: string | null;
            description: string | null;
            leadId: string;
            dueDate: Date | null;
            completedAt: Date | null;
            priority: import(".prisma/client").$Enums.TaskPriority;
            status: import(".prisma/client").$Enums.TaskStatus;
        })[];
        events: ({
            user: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.LeadEventType;
            description: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            leadId: string;
            userId: string | null;
        })[];
        pipeline: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            area: string;
            isDefault: boolean;
        };
        stage: {
            id: string;
            name: string;
            createdAt: Date;
            isLost: boolean;
            isWon: boolean;
            pipelineId: string;
            color: string;
            order: number;
            autoRules: import("@prisma/client/runtime/library").JsonValue | null;
        };
        campaign: {
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
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        isActive: boolean;
        pipelineId: string;
        source: string;
        phone: string;
        bankWorked: string | null;
        timeSinceDismissal: string | null;
        adName: string | null;
        formName: string | null;
        lgpdConsent: boolean;
        slaStatus: import(".prisma/client").$Enums.SlaStatus;
        firstContactAt: Date | null;
        lastContactAt: Date | null;
        notes: string | null;
        tags: string[];
        stageId: string;
        assignedToId: string | null;
        campaignId: string | null;
    }>;
    create(tenantId: string, userId: string, dto: any): Promise<{
        existing: boolean;
        lead: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            email: string | null;
            isActive: boolean;
            pipelineId: string;
            source: string;
            phone: string;
            bankWorked: string | null;
            timeSinceDismissal: string | null;
            adName: string | null;
            formName: string | null;
            lgpdConsent: boolean;
            slaStatus: import(".prisma/client").$Enums.SlaStatus;
            firstContactAt: Date | null;
            lastContactAt: Date | null;
            notes: string | null;
            tags: string[];
            stageId: string;
            assignedToId: string | null;
            campaignId: string | null;
        };
    }>;
    update(tenantId: string, userId: string, id: string, dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        isActive: boolean;
        pipelineId: string;
        source: string;
        phone: string;
        bankWorked: string | null;
        timeSinceDismissal: string | null;
        adName: string | null;
        formName: string | null;
        lgpdConsent: boolean;
        slaStatus: import(".prisma/client").$Enums.SlaStatus;
        firstContactAt: Date | null;
        lastContactAt: Date | null;
        notes: string | null;
        tags: string[];
        stageId: string;
        assignedToId: string | null;
        campaignId: string | null;
    }>;
    moveStage(tenantId: string, userId: string, leadId: string, stageId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        isActive: boolean;
        pipelineId: string;
        source: string;
        phone: string;
        bankWorked: string | null;
        timeSinceDismissal: string | null;
        adName: string | null;
        formName: string | null;
        lgpdConsent: boolean;
        slaStatus: import(".prisma/client").$Enums.SlaStatus;
        firstContactAt: Date | null;
        lastContactAt: Date | null;
        notes: string | null;
        tags: string[];
        stageId: string;
        assignedToId: string | null;
        campaignId: string | null;
    }>;
    addNote(tenantId: string, userId: string, leadId: string, note: string): Promise<{
        success: boolean;
    }>;
    registerWhatsappContact(tenantId: string, userId: string, leadId: string): Promise<{
        success: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getKanban(tenantId: string, pipelineId: string): Promise<{
        stages: ({
            leads: ({
                campaign: {
                    id: string;
                    name: string;
                };
                assignedTo: {
                    id: string;
                    name: string;
                };
                _count: {
                    tasks: number;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                email: string | null;
                isActive: boolean;
                pipelineId: string;
                source: string;
                phone: string;
                bankWorked: string | null;
                timeSinceDismissal: string | null;
                adName: string | null;
                formName: string | null;
                lgpdConsent: boolean;
                slaStatus: import(".prisma/client").$Enums.SlaStatus;
                firstContactAt: Date | null;
                lastContactAt: Date | null;
                notes: string | null;
                tags: string[];
                stageId: string;
                assignedToId: string | null;
                campaignId: string | null;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            isLost: boolean;
            isWon: boolean;
            pipelineId: string;
            color: string;
            order: number;
            autoRules: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        area: string;
        isDefault: boolean;
    }>;
}
