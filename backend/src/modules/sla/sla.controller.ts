import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SlaService } from './sla.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('SLA')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('sla')
export class SlaController {
  constructor(private slaService: SlaService) {}

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.slaService.getSlaStats(user.tenantId);
  }
}
