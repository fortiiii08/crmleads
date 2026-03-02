import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.reportsService.getDashboard(user.tenantId);
  }

  @Get('campaigns')
  getByCampaign(@CurrentUser() user: any) {
    return this.reportsService.getLeadsByCampaign(user.tenantId);
  }

  @Get('agents')
  getByAgent(@CurrentUser() user: any) {
    return this.reportsService.getLeadsByAgent(user.tenantId);
  }

  @Get('leads-by-day')
  getByDay(@CurrentUser() user: any, @Query('days') days: number = 30) {
    return this.reportsService.getLeadsByDay(user.tenantId, Number(days));
  }
}
