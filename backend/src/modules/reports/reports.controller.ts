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
  getDashboard(
    @CurrentUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getDashboard(user.tenantId, from, to);
  }

  @Get('campaigns')
  getByCampaign(@CurrentUser() user: any) {
    return this.reportsService.getLeadsByCampaign(user.tenantId);
  }

  @Get('agents')
  getByAgent(
    @CurrentUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getLeadsByAgent(user.tenantId, from, to);
  }

  @Get('leads-by-day')
  getByDay(
    @CurrentUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('days') days?: number,
  ) {
    return this.reportsService.getLeadsByDay(user.tenantId, from, to, days ? Number(days) : 14);
  }
}
