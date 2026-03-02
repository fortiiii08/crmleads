import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.campaign.findMany({
      where: { tenantId },
      include: { _count: { select: { leads: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.campaign.create({
      data: { tenantId, name: dto.name, source: dto.source || 'linkedin', budget: dto.budget, startDate: dto.startDate, endDate: dto.endDate },
    });
  }
}
