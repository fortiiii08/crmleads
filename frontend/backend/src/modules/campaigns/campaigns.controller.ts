import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Campaigns')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('campaigns')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.campaignsService.findAll(user.tenantId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.campaignsService.create(user.tenantId, dto);
  }
}
