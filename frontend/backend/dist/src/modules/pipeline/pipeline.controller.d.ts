import { PipelineService } from './pipeline.service';
export declare class PipelineController {
    private pipelineService;
    constructor(pipelineService: PipelineService);
    findAll(user: any): Promise<({
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
    findOne(user: any, id: string): Promise<{
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
    create(user: any, dto: any): Promise<{
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
