import { TasksService } from './tasks.service';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    findAll(user: any, leadId?: string): Promise<({
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
    create(user: any, dto: any): Promise<{
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
    complete(user: any, id: string): Promise<{
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
