import { PrismaService } from '../../common/prisma/prisma.service';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, leadId?: string): Promise<({
        assignedTo: {
            id: string;
            name: string;
        };
        lead: {
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
    })[]>;
    create(tenantId: string, userId: string, dto: any): Promise<{
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
    }>;
    complete(tenantId: string, userId: string, taskId: string): Promise<{
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
    }>;
}
