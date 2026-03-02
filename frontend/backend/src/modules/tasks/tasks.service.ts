import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, leadId?: string) {
    return this.prisma.task.findMany({
      where: { tenantId, ...(leadId && { leadId }) },
      include: { assignedTo: { select: { id: true, name: true } }, lead: { select: { id: true, name: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async create(tenantId: string, userId: string, dto: any) {
    const task = await this.prisma.task.create({
      data: {
        tenantId,
        leadId: dto.leadId,
        assignedToId: dto.assignedToId || userId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        priority: dto.priority || 'MEDIUM',
      },
    });

    await this.prisma.leadEvent.create({
      data: { leadId: dto.leadId, userId, type: 'TASK_CREATED', description: `Tarefa criada: ${dto.title}` },
    });

    return task;
  }

  async complete(tenantId: string, userId: string, taskId: string) {
    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await this.prisma.leadEvent.create({
      data: { leadId: task.leadId, userId, type: 'TASK_COMPLETED', description: `Tarefa concluída: ${task.title}` },
    });

    return task;
  }
}
