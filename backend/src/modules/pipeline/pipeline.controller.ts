import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Pipeline')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('pipelines')
export class PipelineController {
  constructor(private pipelineService: PipelineService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.pipelineService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pipelineService.findOne(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.pipelineService.create(user.tenantId, dto);
  }

  @Put('stages/:stageId')
  updateStage(@Param('stageId') stageId: string, @Body() dto: any) {
    return this.pipelineService.updateStage(stageId, dto);
  }
}
