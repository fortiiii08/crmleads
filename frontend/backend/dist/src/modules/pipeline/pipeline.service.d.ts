import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PipelineService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<({
        stages: {
            id: string;
            name: string;
            createdAt: Date;
            isLost: boolean;
            isWon: boolean;
            pipelineId: string;
            color: string;
            order: number;
            autoRules: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        area: string;
        isDefault: boolean;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        stages: {
            id: string;
            name: string;
            createdAt: Date;
            isLost: boolean;
            isWon: boolean;
            pipelineId: string;
            color: string;
            order: number;
            autoRules: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        area: string;
        isDefault: boolean;
    }>;
    create(tenantId: string, dto: any): Promise<{
        stages: {
            id: string;
            name: string;
            createdAt: Date;
            isLost: boolean;
            isWon: boolean;
            pipelineId: string;
            color: string;
            order: number;
            autoRules: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        area: string;
        isDefault: boolean;
    }>;
    updateStage(stageId: string, dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        isLost: boolean;
        isWon: boolean;
        pipelineId: string;
        color: string;
        order: number;
        autoRules: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
