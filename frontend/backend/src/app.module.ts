import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LeadsModule } from './modules/leads/leads.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ScriptsModule } from './modules/scripts/scripts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { SlaModule } from './modules/sla/sla.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    LeadsModule,
    PipelineModule,
    TasksModule,
    ScriptsModule,
    ReportsModule,
    WebhooksModule,
    CampaignsModule,
    SlaModule,
  ],
})
export class AppModule {}
