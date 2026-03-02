"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const leads_module_1 = require("./modules/leads/leads.module");
const pipeline_module_1 = require("./modules/pipeline/pipeline.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const scripts_module_1 = require("./modules/scripts/scripts.module");
const reports_module_1 = require("./modules/reports/reports.module");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const campaigns_module_1 = require("./modules/campaigns/campaigns.module");
const sla_module_1 = require("./modules/sla/sla.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            leads_module_1.LeadsModule,
            pipeline_module_1.PipelineModule,
            tasks_module_1.TasksModule,
            scripts_module_1.ScriptsModule,
            reports_module_1.ReportsModule,
            webhooks_module_1.WebhooksModule,
            campaigns_module_1.CampaignsModule,
            sla_module_1.SlaModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map