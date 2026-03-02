import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PipelineService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.pipeline.findFirst({
      where: { tenantId, id },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.pipeline.create({
      data: {
        tenantId,
        name: dto.name,
        area: dto.area,
        isDefault: dto.isDefault ?? false,
        stages: {
          create: dto.stages?.map((s: any, i: number) => ({
            name: s.name,
            color: s.color || '#6366f1',
            order: i + 1,
            isWon: s.isWon || false,
            isLost: s.isLost || false,
          })) || [],
        },
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }

  async updateStage(stageId: string, dto: any) {
    return this.prisma.stage.update({
      where: { id: stageId },
      data: { name: dto.name, color: dto.color, order: dto.order },
    });
  }
}
