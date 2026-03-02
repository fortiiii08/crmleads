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
exports.ScriptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ScriptsService = class ScriptsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, category) {
        return this.prisma.script.findMany({
            where: { tenantId, isActive: true, ...(category && { category: category }) },
            orderBy: [{ category: 'asc' }, { title: 'asc' }],
        });
    }
    async findOne(tenantId, id) {
        return this.prisma.script.findFirst({ where: { tenantId, id } });
    }
    async create(tenantId, dto) {
        return this.prisma.script.create({
            data: { tenantId, title: dto.title, content: dto.content, category: dto.category, area: dto.area, variables: dto.variables || [] },
        });
    }
    async update(tenantId, id, dto) {
        return this.prisma.script.update({
            where: { id },
            data: { title: dto.title, content: dto.content, category: dto.category, area: dto.area },
        });
    }
    async incrementUsage(tenantId, id) {
        return this.prisma.script.update({ where: { id }, data: { usageCount: { increment: 1 } } });
    }
};
exports.ScriptsService = ScriptsService;
exports.ScriptsService = ScriptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScriptsService);
//# sourceMappingURL=scripts.service.js.map