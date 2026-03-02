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
exports.SlaService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let SlaService = class SlaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkSla() {
        const now = new Date();
        const leadsToCheck = await this.prisma.lead.findMany({
            where: {
                firstContactAt: null,
                isActive: true,
                stage: { isLost: false, isWon: false },
            },
            select: { id: true, createdAt: true, slaStatus: true, assignedToId: true },
        });
        for (const lead of leadsToCheck) {
            const minutesSinceCreation = (now.getTime() - lead.createdAt.getTime()) / 60000;
            let newStatus = client_1.SlaStatus.OK;
            if (minutesSinceCreation >= 30)
                newStatus = client_1.SlaStatus.OVERDUE;
            else if (minutesSinceCreation >= 10)
                newStatus = client_1.SlaStatus.CRITICAL;
            else if (minutesSinceCreation >= 5)
                newStatus = client_1.SlaStatus.WARNING;
            if (newStatus !== lead.slaStatus) {
                await this.prisma.lead.update({
                    where: { id: lead.id },
                    data: { slaStatus: newStatus },
                });
                if (newStatus === client_1.SlaStatus.WARNING || newStatus === client_1.SlaStatus.CRITICAL || newStatus === client_1.SlaStatus.OVERDUE) {
                    await this.prisma.leadEvent.create({
                        data: {
                            leadId: lead.id,
                            type: newStatus === client_1.SlaStatus.OVERDUE ? 'SLA_OVERDUE' : 'SLA_WARNING',
                            description: `SLA: ${minutesSinceCreation.toFixed(0)} minutos sem contato`,
                        },
                    });
                }
            }
        }
    }
    async getSlaStats(tenantId) {
        const [ok, warning, critical, overdue] = await Promise.all([
            this.prisma.lead.count({ where: { tenantId, slaStatus: 'OK', isActive: true } }),
            this.prisma.lead.count({ where: { tenantId, slaStatus: 'WARNING', isActive: true } }),
            this.prisma.lead.count({ where: { tenantId, slaStatus: 'CRITICAL', isActive: true } }),
            this.prisma.lead.count({ where: { tenantId, slaStatus: 'OVERDUE', isActive: true } }),
        ]);
        return { ok, warning, critical, overdue };
    }
};
exports.SlaService = SlaService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlaService.prototype, "checkSla", null);
exports.SlaService = SlaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SlaService);
//# sourceMappingURL=sla.service.js.map