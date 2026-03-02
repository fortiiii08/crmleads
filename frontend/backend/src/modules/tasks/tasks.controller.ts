import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('leadId') leadId?: string) {
    return this.tasksService.findAll(user.tenantId, leadId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.tasksService.create(user.tenantId, user.id, dto);
  }

  @Patch(':id/complete')
  complete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.complete(user.tenantId, user.id, id);
  }
}
