import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ScriptsService } from './scripts.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Scripts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('scripts')
export class ScriptsController {
  constructor(private scriptsService: ScriptsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('category') category?: string) {
    return this.scriptsService.findAll(user.tenantId, category);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.scriptsService.findOne(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.scriptsService.create(user.tenantId, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.scriptsService.update(user.tenantId, id, dto);
  }

  @Post(':id/use')
  incrementUsage(@CurrentUser() user: any, @Param('id') id: string) {
    return this.scriptsService.incrementUsage(user.tenantId, id);
  }
}
