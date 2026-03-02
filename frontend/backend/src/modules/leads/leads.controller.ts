import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query() filters: any) {
    return this.leadsService.findAll(user.tenantId, filters);
  }

  @Get('kanban/:pipelineId')
  getKanban(@CurrentUser() user: any, @Param('pipelineId') pipelineId: string) {
    return this.leadsService.getKanban(user.tenantId, pipelineId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.findOne(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.leadsService.create(user.tenantId, user.id, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.leadsService.update(user.tenantId, user.id, id, dto);
  }

  @Patch(':id/stage')
  moveStage(@CurrentUser() user: any, @Param('id') id: string, @Body('stageId') stageId: string) {
    return this.leadsService.moveStage(user.tenantId, user.id, id, stageId);
  }

  @Post(':id/notes')
  addNote(@CurrentUser() user: any, @Param('id') id: string, @Body('note') note: string) {
    return this.leadsService.addNote(user.tenantId, user.id, id, note);
  }

  @Post(':id/whatsapp')
  registerWhatsapp(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.registerWhatsappContact(user.tenantId, user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.remove(user.tenantId, id);
  }
}
