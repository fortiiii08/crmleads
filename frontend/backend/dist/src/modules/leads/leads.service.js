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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let LeadsService = class LeadsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, filters = {}) {
        const where = { tenantId, isActive: true };
        if (filters.stageId)
            where.stageId = filters.stageId;
        if (filters.pipelineId)
            where.pipelineId = filters.pipelineId;
        if (filters.assignedToId)
            where.assignedToId = filters.assignedToId;
        if (filters.slaStatus)
            where.slaStatus = filters.slaStatus;
        if (filters.campaignId)
            where.campaignId = filters.campaignId;
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search } },
            ];
        }
        return this.prisma.lead.findMany({
            where,
            include: {
                stage: true,
                assignedTo: { select: { id: true, name: true, email: true } },
                campaign: { select: { id: true, name: true } },
                _count: { select: { events: true, tasks: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(tenantId, id) {
        return this.prisma.lead.findFirst({
            where: { tenantId, id },
            include: {
                stage: true,
                pipeline: true,
                assignedTo: { select: { id: true, name: true, email: true } },
                campaign: true,
                events: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                tasks: {
                    include: { assignedTo: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    async create(tenantId, userId, dto) {
        const existing = await this.prisma.lead.findFirst({
            where: { tenantId, phone: dto.phone },
        });
        if (existing)
            return { existing: true, lead: existing };
        const pipeline = await this.prisma.pipeline.findFirst({
            where: { tenantId, isDefault: true },
            include: { stages: { orderBy: { order: 'asc' } } },
        });
        const lead = await this.prisma.lead.create({
            data: {
                tenantId,
                pipelineId: dto.pipelineId || pipeline.id,
                stageId: dto.stageId || pipeline.stages[0].id,
                assignedToId: dto.assignedToId || null,
                campaignId: dto.campaignId || null,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                bankWorked: dto.bankWorked,
                timeSinceDismissal: dto.timeSinceDismissal,
                source: dto.source || 'linkedin',
                adName: dto.adName,
                formName: dto.formName,
                lgpdConsent: dto.lgpdConsent ?? true,
                notes: dto.notes,
            },
        });
        await this.prisma.leadEvent.create({
            data: {
                leadId: lead.id,
                userId,
                type: 'CREATED',
                description: `Lead criado via ${dto.source || 'sistema'}`,
            },
        });
        return { existing: false, lead };
    }
    async update(tenantId, userId, id, dto) {
        const lead = await this.prisma.lead.findFirst({ where: { tenantId, id } });
        if (!lead)
            return null;
        const updated = await this.prisma.lead.update({
            where: { id },
            data: {
                name: dto.name ?? lead.name,
                email: dto.email ?? lead.email,
                phone: dto.phone ?? lead.phone,
                bankWorked: dto.bankWorked ?? lead.bankWorked,
                timeSinceDismissal: dto.timeSinceDismissal ?? lead.timeSinceDismissal,
                assignedToId: dto.assignedToId !== undefined ? dto.assignedToId : lead.assignedToId,
                campaignId: dto.campaignId !== undefined ? dto.campaignId : lead.campaignId,
                notes: dto.notes ?? lead.notes,
                tags: dto.tags ?? lead.tags,
            },
        });
        return updated;
    }
    async moveStage(tenantId, userId, leadId, stageId) {
        const lead = await this.prisma.lead.findFirst({ where: { tenantId, id: leadId }, include: { stage: true } });
        if (!lead)
            return null;
        const newStage = await this.prisma.stage.findUnique({ where: { id: stageId } });
        const updated = await this.prisma.lead.update({
            where: { id: leadId },
            data: { stageId },
        });
        await this.prisma.leadEvent.create({
            data: {
                leadId,
                userId,
                type: 'STAGE_CHANGED',
                description: `Movido de "${lead.stage.name}" para "${newStage.name}"`,
                metadata: { from: lead.stageId, to: stageId },
            },
        });
        return updated;
    }
    async addNote(tenantId, userId, leadId, note) {
        await this.prisma.leadEvent.create({
            data: {
                leadId,
                userId,
                type: 'NOTE_ADDED',
                description: note,
            },
        });
        return { success: true };
    }
    async registerWhatsappContact(tenantId, userId, leadId) {
        const lead = await this.prisma.lead.findFirst({ where: { tenantId, id: leadId } });
        if (!lead)
            return null;
        const now = new Date();
        await this.prisma.lead.update({
            where: { id: leadId },
            data: {
                lastContactAt: now,
                firstContactAt: lead.firstContactAt ?? now,
                slaStatus: client_1.SlaStatus.OK,
            },
        });
        await this.prisma.leadEvent.create({
            data: {
                leadId,
                userId,
                type: 'WHATSAPP_SENT',
                description: 'Contato via WhatsApp iniciado',
            },
        });
        return { success: true };
    }
    async remove(tenantId, id) {
        const lead = await this.prisma.lead.findFirst({ where: { tenantId, id } });
        if (!lead)
            return null;
        await this.prisma.leadEvent.deleteMany({ where: { leadId: id } });
        await this.prisma.task.deleteMany({ where: { leadId: id } });
        await this.prisma.lead.delete({ where: { id } });
        return { success: true };
    }
    async getKanban(tenantId, pipelineId) {
        const pipeline = await this.prisma.pipeline.findFirst({
            where: { tenantId, id: pipelineId },
            include: {
                stages: {
                    orderBy: { order: 'asc' },
                    include: {
                        leads: {
                            where: { isActive: true },
                            include: {
                                assignedTo: { select: { id: true, name: true } },
                                campaign: { select: { id: true, name: true } },
                                _count: { select: { tasks: true } },
                            },
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });
        return pipeline;
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map