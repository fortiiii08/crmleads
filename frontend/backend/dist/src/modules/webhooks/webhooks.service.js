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
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let WebhooksService = class WebhooksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async receiveLinkedIn(tenantSlug, payload) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
        if (!tenant)
            return { error: 'Tenant não encontrado' };
        const pipeline = await this.prisma.pipeline.findFirst({
            where: { tenantId: tenant.id, isDefault: true },
            include: { stages: { orderBy: { order: 'asc' } } },
        });
        const phone = payload.phone || payload.telefone || payload['li:phone'] || '';
        const email = payload.email || payload['li:email'] || '';
        const name = payload.name || payload.nome || payload['li:firstName'] + ' ' + payload['li:lastName'] || 'Lead LinkedIn';
        const existing = await this.prisma.lead.findFirst({ where: { tenantId: tenant.id, phone } });
        if (existing)
            return { duplicate: true, leadId: existing.id };
        const lead = await this.prisma.lead.create({
            data: {
                tenantId: tenant.id,
                pipelineId: pipeline.id,
                stageId: pipeline.stages[0].id,
                name: name.trim(),
                email,
                phone,
                bankWorked: payload.banco || payload.bankWorked || '',
                timeSinceDismissal: payload.tempoDesligamento || payload.timeSinceDismissal || '',
                source: 'linkedin',
                adName: payload.adName || payload.anuncio || '',
                formName: payload.formName || payload.formulario || '',
                lgpdConsent: true,
            },
        });
        await this.prisma.leadEvent.create({
            data: { leadId: lead.id, type: 'CREATED', description: 'Lead recebido via webhook LinkedIn/Pluga' },
        });
        return { success: true, leadId: lead.id };
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map