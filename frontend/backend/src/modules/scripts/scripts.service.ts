import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ScriptsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, category?: string) {
    return this.prisma.script.findMany({
      where: { tenantId, isActive: true, ...(category && { category: category as any }) },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.script.findFirst({ where: { tenantId, id } });
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.script.create({
      data: { tenantId, title: dto.title, content: dto.content, category: dto.category, area: dto.area, variables: dto.variables || [] },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    return this.prisma.script.update({
      where: { id },
      data: { title: dto.title, content: dto.content, category: dto.category, area: dto.area },
    });
  }

  async incrementUsage(tenantId: string, id: string) {
    return this.prisma.script.update({ where: { id }, data: { usageCount: { increment: 1 } } });
  }
}
