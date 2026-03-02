"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, leadId) {
        return this.prisma.task.findMany({
            where: { tenantId, ...(leadId && { leadId }) },
            include: { assignedTo: { select: { id: true, name: true } }, lead: { select: { id: true, name: true } } },
            orderBy: { dueDate: 'asc' },
        });
    }
    async create(tenantId, userId, dto) {
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
    async complete(tenantId, userId, taskId) {
        const task = await this.prisma.task.update({
            where: { id: taskId },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
        await this.prisma.leadEvent.create({
            data: { leadId: task.leadId, userId, type: 'TASK_COMPLETED', description: `Tarefa concluída: ${task.title}` },
        });
        return task;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map