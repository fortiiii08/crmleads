import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ScriptsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, category?: string): Promise<{
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
    findOne(tenantId: string, id: string): Promise<{
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
    create(tenantId: string, dto: any): Promise<{
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
    update(tenantId: string, id: string, dto: any): Promise<{
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
    incrementUsage(tenantId: string, id: string): Promise<{
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
