import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SlaStatus } from '@prisma/client';

@Injectable()
export class SlaService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
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
      let newStatus: SlaStatus = SlaStatus.OK;

      if (minutesSinceCreation >= 30) newStatus = SlaStatus.OVERDUE;
      else if (minutesSinceCreation >= 10) newStatus = SlaStatus.CRITICAL;
      else if (minutesSinceCreation >= 5) newStatus = SlaStatus.WARNING;

      if (newStatus !== lead.slaStatus) {
        await this.prisma.lead.update({
          where: { id: lead.id },
          data: { slaStatus: newStatus },
        });

        if (newStatus === SlaStatus.WARNING || newStatus === SlaStatus.CRITICAL || newStatus === SlaStatus.OVERDUE) {
          await this.prisma.leadEvent.create({
            data: {
              leadId: lead.id,
              type: newStatus === SlaStatus.OVERDUE ? 'SLA_OVERDUE' : 'SLA_WARNING',
              description: `SLA: ${minutesSinceCreation.toFixed(0)} minutos sem contato`,
            },
          });
        }
      }
    }
  }

  async getSlaStats(tenantId: string) {
    const [ok, warning, critical, overdue] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'OK', isActive: true } }),
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'WARNING', isActive: true } }),
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'CRITICAL', isActive: true } }),
      this.prisma.lead.count({ where: { tenantId, slaStatus: 'OVERDUE', isActive: true } }),
    ]);
    return { ok, warning, critical, overdue };
  }
}
