import { ScriptsService } from './scripts.service';
export declare class ScriptsController {
    private scriptsService;
    constructor(scriptsService: ScriptsService);
    findAll(user: any, category?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        area: string | null;
        title: string;
        content: string;
        category: import(".prisma/client").$Enums.ScriptCategory;
        variables: string[];
        usageCount: number;
    }[]>;
    findOne(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        area: string | null;
        title: string;
        content: string;
        category: import(".prisma/client").$Enums.ScriptCategory;
        variables: string[];
        usageCount: number;
    }>;
    create(user: any, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        area: string | null;
        title: string;
        content: string;
        category: import(".prisma/client").$Enums.ScriptCategory;
        variables: string[];
        usageCount: number;
    }>;
    update(user: any, id: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        area: string | null;
        title: string;
        content: string;
        category: import(".prisma/client").$Enums.ScriptCategory;
        variables: string[];
        usageCount: number;
    }>;
    incrementUsage(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        area: string | null;
        title: string;
        content: string;
        category: import(".prisma/client").$Enums.ScriptCategory;
        variables: string[];
        usageCount: number;
    }>;
}
